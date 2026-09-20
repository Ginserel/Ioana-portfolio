-- Row Level Security for this site
-- ---------------------------------
-- The publishable key is in the JavaScript bundle, so anyone can read it and
-- call the API directly. The login redirect in /admin is a convenience, not a
-- control. These policies are what actually protects the data.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Work through it in three steps - do not paste the whole file blindly, since
-- step 1 may reveal policies that need removing by hand.


-- ===========================================================================
-- STEP 1 - look at what exists today. Run this on its own, first.
-- ===========================================================================

-- One query, one result set. The SQL editor only displays the LAST
-- statement's output, so asking three separate questions would hide the two
-- that matter. Run this whole block and read every row.

select 'rls enabled'::text as what,
       tablename::text     as subject,
       rowsecurity::text   as value
from pg_tables
where schemaname = 'public'
  and tablename in ('projects', 'messages')

union all

select 'policy'::text,
       schemaname::text || '.' || tablename::text || ' -> ' || policyname::text,
       cmd::text || ' for ' || roles::text
from pg_policies
where schemaname in ('public', 'storage')

union all

select 'bucket public'::text, id::text, public::text
from storage.buckets
where id = 'project-images'

order by 1, 2;

-- What you want to see:
--   rls enabled    projects / messages     true   (false = wide open)
--   policy         one row per policy, with the command and the roles
--   bucket public  project-images          true

-- READ THE OUTPUT BEFORE CONTINUING.
--
-- Postgres combines policies with OR, not AND. One permissive leftover is
-- enough to undo everything below: if any policy lets anon select from
-- messages, the messages are public no matter what else is in place.
--
-- Step 2 replaces policies BY NAME, so anything under a different name
-- survives it. The usual culprit is Supabase's own starter policy,
-- "Enable read access for all users", which grants select to anon. If the
-- step 1 output shows that on messages, or anything else granting anon more
-- than "select on projects" and "insert on messages", drop it by hand:
--
--   drop policy "<the exact name from step 1>" on public.messages;
--
-- (Verified on a local Postgres 16: with that starter policy left in place,
-- anon still read every message after step 2 ran. Dropping it took anon's
-- visible messages to zero while the contact form kept working.)


-- ---------------------------------------------------------------------------
-- IF THE DATABASE IS ALREADY SET UP CORRECTLY, STOP HERE.
--
-- As of September 2026 it was, under Supabase's own default policy names.
-- Step 1 returned, in effect:
--
--   messages  INSERT for {anon,authenticated}   <- the contact form
--   messages  SELECT for {authenticated}        <- private, the important one
--   messages  DELETE for {authenticated}
--   projects  SELECT for {public}               <- "public" is the catch-all
--                                                  role, so everyone. Correct
--                                                  for a portfolio.
--   projects  INSERT / UPDATE / DELETE for {authenticated}
--   storage   INSERT / DELETE / SELECT for {authenticated}
--   rls enabled: true on both tables
--
-- That is equivalent to step 2. Running it anyway would add a second set of
-- policies saying the same thing under different names - harmless, but it
-- makes the next audit harder to read. Step 2 is for a database that is
-- missing policies or has permissive ones, not for this shape.
--
-- One that looks wrong and isn't: storage SELECT limited to {authenticated}.
-- The bucket is public, and a public bucket serves files through a URL that
-- doesn't consult object policies, so visitors still see the images.
-- ---------------------------------------------------------------------------


-- ===========================================================================
-- STEP 2 - the policies this site needs.
-- ===========================================================================

-- --- projects: the public reads, only a signed-in user writes ---------------

alter table public.projects enable row level security;

drop policy if exists "Projects are readable by everyone" on public.projects;
create policy "Projects are readable by everyone"
  on public.projects for select
  to anon, authenticated
  using (true);

drop policy if exists "Signed-in users can add projects" on public.projects;
create policy "Signed-in users can add projects"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "Signed-in users can edit projects" on public.projects;
create policy "Signed-in users can edit projects"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Signed-in users can delete projects" on public.projects;
create policy "Signed-in users can delete projects"
  on public.projects for delete
  to authenticated
  using (true);


-- --- messages: anyone may write one, only you may read them ----------------
-- This is the one that matters most. Without it, every name, email address
-- and message people have sent is readable by anyone with the bundle.

alter table public.messages enable row level security;

drop policy if exists "Anyone can send a message" on public.messages;
create policy "Anyone can send a message"
  on public.messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Only signed-in users can read messages" on public.messages;
create policy "Only signed-in users can read messages"
  on public.messages for select
  to authenticated
  using (true);

drop policy if exists "Only signed-in users can delete messages" on public.messages;
create policy "Only signed-in users can delete messages"
  on public.messages for delete
  to authenticated
  using (true);

-- Deliberately no update policy: nothing in the site edits a message.


-- --- storage: images are public to view, only you may change them ----------
-- The delete policy is needed because replacing a cover image now removes
-- the file it replaced.

drop policy if exists "Project images are readable by everyone" on storage.objects;
create policy "Project images are readable by everyone"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Signed-in users can upload project images" on storage.objects;
create policy "Signed-in users can upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

drop policy if exists "Signed-in users can replace project images" on storage.objects;
create policy "Signed-in users can replace project images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

drop policy if exists "Signed-in users can delete project images" on storage.objects;
create policy "Signed-in users can delete project images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');


-- ===========================================================================
-- STEP 3 - check it took effect. Re-run the step 1 queries: rowsecurity
-- should be true for both tables, and the policy list should match the names
-- above with nothing permissive left over.
-- ===========================================================================

-- Then test from outside, as a stranger would. ./supabase/check-rls.sh does
-- this for you; by hand it is:
--
--   curl -s -H "apikey: <your publishable key>" \
--     "<your project url>/rest/v1/messages?select=id&limit=1"
--
-- Read the BODY, not just the status. Row level security doesn't reject the
-- request, it filters the rows away, so a protected table answers 200 with
-- an empty array:
--
--   []            correct - nothing visible to a stranger
--   [{"id":...}]  a leak - the messages are readable by anyone
--   401/403       also fine, the table grant itself refuses strangers
--
-- An empty array only proves something if the table actually has rows in it.
-- The same request against projects should come back WITH rows: the
-- portfolio is meant to be public.
--
-- After running this, sign into /admin and add, reorder and delete a test
-- project to confirm you haven't locked yourself out of your own site.
