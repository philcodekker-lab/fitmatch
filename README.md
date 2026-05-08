# FitMatch — PT marketplace MVP

A small Next.js marketplace that matches users with personal trainers based on a
short quiz (goal, experience, training style, budget, location). Built as an MVP
to onboard the first 50–100 PTs and validate whether users engage with the
matching experience.

```text
Next.js (App Router)  →  React UI + API routes
Prisma + Postgres     →  works locally, on Vercel, on any host
JWT cookie auth       →  bcrypt + jose, simple email/password
Tailwind CSS          →  clean, mobile-first UI
```

> **Deploying to a public URL?**
> - **Never coded before?** → [GET-IT-ONLINE.md](./GET-IT-ONLINE.md) — friendly walkthrough using GUI tools, ~30–45 min.
> - **Comfortable with the command line?** → [DEPLOY.md](./DEPLOY.md) — Vercel + Neon Postgres in ~10 min.

## Quick start (local)

You need a Postgres URL. The easiest options:

- **Neon** ([neon.tech](https://neon.tech)) — free serverless Postgres, copy the pooled connection string.
- **Supabase** — free Postgres, use the transaction-mode connection string.
- **Local Postgres** — `postgresql://postgres:postgres@localhost:5432/fitmatch`

Then:

```bash
# 1. Install
npm install

# 2. Set DATABASE_URL in .env
cp .env.example .env   # then edit .env and paste your Postgres URL

# 3. Create the schema + seed 12 PTs and an admin
npx prisma db push
npm run db:seed

# 4. Run the dev server
npm run dev            # → http://localhost:3000
```

> **Want zero-setup SQLite for prototyping?** Edit `prisma/schema.prisma` and
> change `provider = "postgresql"` to `provider = "sqlite"`, then set
> `DATABASE_URL="file:./dev.db"`. The application code is agnostic to which.

### Demo credentials

| Role  | Email                  | Password      |
| ----- | ---------------------- | ------------- |
| Admin | `admin@fitmatch.dev`   | `admin123`    |
| PT    | any seeded `*@fitmatch.dev` (e.g. `aisha@fitmatch.dev`) | `password123` |

A trainer named **Sam Pending** is seeded as unapproved so you can immediately
exercise the admin approval flow.

## Try it end-to-end

1. **As a user** — visit `/`, click *Start the quiz*, answer the 5 steps, see
   your top 3 matches, click through to a public profile, click *Contact …* to
   open a `mailto:` link.
2. **As a PT** — `/pt/signup` → fill in your profile → notice the "Pending
   review" banner → log in to admin to approve yourself.
3. **As an admin** — `/admin/login` → approve / unapprove / feature / remove
   trainers in the dashboard.

## Project layout

```
prisma/
  schema.prisma           SQLite schema (User, TrainerProfile)
  seed.js                 12 trainers + 1 admin
src/
  app/
    layout.jsx            Root layout with shared <Navbar />
    page.jsx              Landing page (hero, value props, featured PTs)
    quiz/page.jsx         Multi-step quiz (client component)
    results/page.jsx      Calls /api/match and renders top 3
    pts/[id]/page.jsx     Public PT profile + Contact button (mailto:)
    pt/{login,signup,dashboard}/page.jsx
    admin/{login,dashboard}/page.jsx
    api/
      auth/{login,signup,logout,me}/route.js
      pts/route.js          GET (public list, approved only)
      pts/[id]/route.js     GET single approved profile
      pt/profile/route.js   GET / PUT own profile (PT only)
      match/route.js        POST quiz answers → top 3 matches
      admin/pts/route.js    GET all (admin)
      admin/pts/[id]/route.js  PATCH approve/feature, DELETE
  components/
    Navbar.jsx            Server component, role-aware
    PTCard.jsx            Card used on landing, results, etc.
    ProfileEditor.jsx     PT dashboard form (client)
    AdminTrainerRow.jsx   Admin row with approve/feature/remove
  lib/
    db.js                 Prisma client (cached across HMR)
    auth.js               bcrypt + JWT cookie helpers
    matching.js           Weighted scoring + ranking
    constants.js          Goal/style/level/budget option lists
    profile.js            JSON-array encode/decode helpers
```

## How matching works

`src/lib/matching.js` scores each approved trainer against the quiz answers.
Weights (sum to 100, plus a small featured boost):

| Signal                                 | Weight | Notes                                            |
| -------------------------------------- | ------ | ------------------------------------------------ |
| Goal matches a specialism              | 40     | Half-credit for general-fitness fallback          |
| Training style matches                  | 20     | Hybrid trainers and hybrid users always match    |
| PT works with the chosen experience    | 15     |                                                  |
| Pricing range overlaps the budget      | 15     |                                                  |
| Location substring match               | 10     | Half-credit if the PT is "Remote"                |
| Featured (monetisation placeholder)    | +5     | Only nudges ties; cannot override a real match   |

The endpoint is `POST /api/match` — body: `{goal, experience, trainingStyle, budget, location}`.
Top 3 are returned with the per-trainer score and a small list of human-readable
reasons that the UI shows under each card.

## Customising the data

- **Reset the database**: `npm run db:reset` (wipes + reseeds).
- **Add specialisms**: edit `src/lib/constants.js` — IDs are the strings stored
  in `TrainerProfile.specialisms`.
- **Already on Postgres** by default. Switch hosts (Neon, Supabase, Railway,
  RDS) by pointing `DATABASE_URL` at the new instance and re-running
  `npx prisma db push`. See [DEPLOY.md](./DEPLOY.md) for a step-by-step guide.

## Tests

A small standalone smoke test for the matching algorithm lives in
`scripts/test-matching.mjs`. It reimplements the scoring logic so it runs
without needing `npm install`:

```bash
npm run test:matching
# or
node scripts/test-matching.mjs
```

It exercises five realistic quiz scenarios and asserts the expected trainer
wins each one.

## What's intentionally out of scope (MVP)

- Payments and bookings — *Contact PT* is a `mailto:` link.
- Messaging system.
- Reviews and ratings.
- Image uploads for PT avatars (initials are rendered for now).
- Full Postgres migration (the swap is a one-line provider change + an
  `npx prisma migrate dev`).

## Notes on auth

- Email + bcrypt password, signed JWT in an `httpOnly` cookie via
  [`jose`](https://github.com/panva/jose). Sessions expire after 7 days.
- New PT signups create a `TrainerProfile` with `approved=false` so an admin
  has to flip the flag before they appear in matches.
- There is no public sign-up for users (the quiz is anonymous), so user-side
  auth is intentionally absent. Adding it later means swapping the `getCurrentUser`
  helper for a more general one and adding a `User.role = "USER"` branch.

## Environment variables

| Var            | Required | Notes                                    |
| -------------- | -------- | ---------------------------------------- |
| `DATABASE_URL` | yes      | `file:./dev.db` for SQLite, or a Postgres URL |
| `AUTH_SECRET`  | yes      | ≥ 32 random characters in production      |

Copy `.env.example` to `.env` (already done in this repo for first-run convenience)
and rotate the secret before deploying.
