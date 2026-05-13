# Deploying FindMyPT to Vercel + Postgres

This is the recommended path: a free Postgres database on Neon and a free
Vercel deployment. End-to-end, ~10 minutes. You'll get a public URL like
`https://fitmatch.vercel.app`.

If you prefer Supabase or a different Postgres host, the steps are identical —
just paste a different `DATABASE_URL`.

---

## 0. Prerequisites

- A free [Neon](https://neon.tech) account (or Supabase / any Postgres host).
- A free [Vercel](https://vercel.com) account.
- A free [GitHub](https://github.com) account (for the easiest deploy path).
- Node 18+ and `npm` locally — only needed to run the seed script once at the end.

---

## 1. Create a Postgres database (Neon)

1. Go to [console.neon.tech](https://console.neon.tech) and create a project — accept the defaults.
2. On the project's dashboard, copy the **pooled connection string**. It looks like:

   ```
   postgresql://neondb_owner:XXXX@ep-xxxxx-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

3. Keep this tab open — you'll paste this in two places shortly.

> **Why pooled?** Vercel runs each request in a serverless function, which would
> exhaust direct Postgres connections. Neon's `-pooler` host fronts the DB with
> PgBouncer and avoids the issue. (Supabase calls the equivalent the
> "transaction-mode" connection string.)

---

## 2. Generate an `AUTH_SECRET`

In a terminal:

```bash
openssl rand -base64 48
```

Copy the output. This signs the JWT in the auth cookie — keep it secret, keep it
random.

---

## 3. Push the project to GitHub

From inside the project folder:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create fitmatch --private --source=. --push
# or, without GitHub CLI:
#   create the repo on github.com, then:
#   git remote add origin git@github.com:<you>/fitmatch.git
#   git push -u origin main
```

The `.env` file is `.gitignore`d so secrets won't leak.

---

## 4. Import the repo into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and pick the GitHub repo.
2. Vercel auto-detects Next.js — leave Framework Preset and Build Command as-is.
3. Open **Environment Variables** and add **two**:

   | Name           | Value                                           |
   | -------------- | ----------------------------------------------- |
   | `DATABASE_URL` | The pooled Postgres URL from step 1             |
   | `AUTH_SECRET`  | The random string from step 2                   |

4. Click **Deploy**.

The first build takes ~90 seconds. Vercel runs `prisma generate` then
`next build` (because of the `build` script in `package.json`) and then ships
the result.

When it finishes you'll see the URL. The site is live but the database is empty
— next step.

---

## 5. Push the schema and seed the production database

You only need to do this once. Run it locally with the production
`DATABASE_URL`:

```bash
# Replace with the URL from step 1
export DATABASE_URL="postgresql://neondb_owner:...@ep-...-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

npm install                # if you haven't already
npx prisma db push         # creates the tables
npm run db:seed            # 12 PTs + admin user
```

> **Heads up:** the seed uses `upsert`, so it's safe to re-run.

Visit your Vercel URL — the landing page now shows featured trainers.

---

## 6. Smoke test the live site

- **`/`** — featured trainers should render.
- **`/quiz`** — answer the 5 steps, get top 3 matches.
- **`/admin/login`** — `admin@fitmatch.dev` / `admin123` → admin dashboard, approve `Sam Pending`, watch them appear in `/`.
- **`/pt/login`** — `aisha@fitmatch.dev` / `password123` → edit profile.

> **Important:** the seeded admin password (`admin123`) is fine for a demo but
> not for anything real. To rotate it, log into the admin account once, then run
> a one-off SQL update or edit `prisma/seed.js` and re-seed.

---

## 7. Day-2 operations

### Pulling new code → re-deploy
Vercel watches your `main` branch. Every push redeploys. Database stays untouched.

### Schema changes
Edit `prisma/schema.prisma`, then:
```bash
npx prisma db push       # pushes to whichever DATABASE_URL is in your env
```
For real production work you'd want `prisma migrate dev` + `prisma migrate deploy`
in the build pipeline, but for an MVP `db push` is fine.

### Backups
Neon has automatic point-in-time restore on the free tier. Supabase has nightly
backups on paid tiers — for a real launch, upgrade or set up `pg_dump` on a cron.

### Custom domain
In Vercel → Project → Settings → Domains. Add your domain, point its DNS at
Vercel's nameservers, done. SSL is automatic.

---

## Alternative: Supabase instead of Neon

Steps 1 and 5 change slightly:

- Create a Supabase project, then **Settings → Database → Connection string →
  URI**. Use the **transaction-mode** string (pooler host) for `DATABASE_URL`.
- Everything else is the same.

If you want to use Supabase Auth as well, you'd swap `src/lib/auth.js` for the
Supabase client and remove the JWT-cookie helpers — that's a larger refactor and
not needed for the MVP.

---

## Alternative: Vercel CLI (no GitHub)

If you don't want a GitHub repo:

```bash
npm install -g vercel
vercel               # interactive: pick the project, set env vars
vercel --prod        # promote to production
```

The CLI uploads the files directly. You still need to set `DATABASE_URL` and
`AUTH_SECRET` either via the prompts or in the Vercel dashboard.

---

## Troubleshooting

- **"PrismaClient is unable to be run in this browser environment"** at build
  time — this means a server-only file got imported into a Client Component.
  All Prisma calls live in `src/lib/db.js`, which is only imported by Server
  Components and Route Handlers in this project; if you add new code, keep that
  rule.
- **`fetch failed` / SSL errors connecting to Postgres** — make sure the
  connection string ends with `?sslmode=require` and that you're using the
  **pooled** host on Neon.
- **Cookies not persisting after login** — confirm you're on `https://` (Vercel
  is by default). The cookie has the `secure` flag in production.
- **Build fails with "Module not found: @prisma/client"** — re-deploy; this
  occasionally happens if Vercel cached a stale `node_modules`. The
  `build` script runs `prisma generate` first to regenerate the client.
