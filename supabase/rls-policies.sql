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

-- Is RLS switched on at all? rowsecurity must be true for both tables.
-- If it is false, every policy below is ignored and the table is wide open.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('projects', 'messages');

-- Which policies are already in place, and who they apply to?
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- Is the image bucket public? It needs to be, for getPublicUrl to work.
select id, name, public from storage.buckets where id = 'project-images';

-- READ THE OUTPUT BEFORE CONTINUING.
-- Step 2 replaces policies by name. Any existing policy under a DIFFERENT
-- name stays, and a permissive leftover (for example one allowing anon to
-- select from messages) would still apply. Drop those yourself:
--   drop policy "<the name from above>" on public.<table>;


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

-- Then test from outside, as a stranger would, in a terminal:
--
--   curl -s -o /dev/null -w "%{http_code}\n" \
--     -H "apikey: <your publishable key>" \
--     "<your project url>/rest/v1/messages?select=id&limit=1"
--
-- 401 or 403 is correct. 200 means the messages are still readable by anyone
-- and something above has not applied.
--
--   curl -s -o /dev/null -w "%{http_code}\n" \
--     -H "apikey: <your publishable key>" \
--     "<your project url>/rest/v1/projects?select=id&limit=1"
--
-- 200 is correct here - the portfolio is meant to be public.
--
-- After running this, sign into /admin and add, reorder and delete a test
-- project to confirm you haven't locked yourself out of your own site.
