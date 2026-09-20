# Ioana Dobrin — portfolio

Portfolio site for a graphic designer and fine artist: fashion licensing,
graphic design, illustration and fine art. React + Vite on the front, Supabase
for the database, file storage and admin login. Deployed on Vercel.

## Running it locally

```bash
npm install
cp .env.example .env   # then fill in the two values
npm run dev
```

The values come from your Supabase project under Project settings → API. Both
are safe in the browser: the publishable key can only do what your Row Level
Security policies allow. A secret key (`sb_secret_…`) bypasses every policy and
must never go in this file.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run lint` | ESLint over the whole project |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built output |

Lint and build also run on every pull request (`.github/workflows/ci.yml`).

## How it's laid out

```
src/
  components/   Navbar, Footer, ProjectFrame (the shared image frame)
  lib/          supabaseClient.js, categories.js
  pages/        Home, Gallery, ProjectDetail, About, Contact, NotFound
  pages/admin/  Login, Dashboard, ProjectForm
```

Two ideas worth knowing before changing anything:

**Artwork is never cropped.** Every image goes through `FramedImage`, which
centres it with `object-contain` on a padded panel. Pieces are all shapes, and
a crop would cut the work. The rule lives in that one component on purpose.

**Categories are defined once**, in `src/lib/categories.js`. The keys are what
the database stores, the values are what visitors read. Adding a category
means editing that file and the dropdown in `pages/admin/ProjectForm.jsx`.

## The admin side

`/caledeacces1988` is the login; `/admin` is the dashboard, where projects are
added, edited, reordered (the up/down arrows swap `order_index`) and deleted,
and where messages from the contact form arrive.

The site orders projects by `order_index` ascending, and the home page shows
the ones flagged `featured` — the lowest `order_index` gets the large frame.

> The login redirect is a convenience, not a security control. Anyone can read
> the publishable key out of the JavaScript bundle and call the API directly,
> so what actually protects the data is Supabase Row Level Security. Writes to
> `projects` should require an authenticated user, and `messages` should allow
> insert but not select. Worth re-checking after any schema change.

## Deployment

Vercel builds from `main`. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are
set in the project's environment variables, per environment — variables in the
environment take precedence over any `.env` file. `vercel.json` rewrites all
paths to `index.html` so client-side routes survive a refresh.
