# Get FitMatch online — beginner guide

> **What you'll end up with:** a real website at a `*.vercel.app` URL (or your
> own domain) that you can share with anyone.
>
> **How long:** about 30–45 minutes the first time. Most of it is signing up for
> free accounts.
>
> **What you need:** a Mac, an email address, and a browser. That's it.

There's a tiny bit of "Terminal" near the end (4 commands you copy-paste). The
rest is clicking buttons in a browser.

---

## The three free services we'll use

Don't try to understand all of these now — you'll meet them one by one.

| Service | What it does | Why we need it |
| --- | --- | --- |
| **GitHub** | Stores your project's files online. | Vercel reads your code from here. |
| **Neon** | Hosts the database. | The website needs somewhere to keep PT profiles, logins, etc. |
| **Vercel** | Hosts the website itself. | This is what gives you the public URL. |

All three are free for what we're doing.

---

## Part 1 — install the two tools you'll need (5 min)

You only do this once. After this you'll never have to install anything again
for this project.

### 1.1 — Install Node.js

Node.js is what runs the website's "engine". We'll only need it once at the very
end, but install it now so it's ready.

1. Open [nodejs.org](https://nodejs.org/en/download).
2. Download the **macOS Installer** — it's a `.pkg` file. Click the big green LTS button.
3. Open the downloaded file and click through (Continue → Continue → Agree → Install). Enter your Mac password when asked.
4. You're done. Nothing visible changes — Node is just available now.

**Check it worked:** open the **Terminal** app (press ⌘+space, type "Terminal", hit Enter). Type:

```bash
node --version
```

You should see something like `v22.22.0`. ✅ If you see "command not found", restart Terminal and try again, or restart your Mac.

### 1.2 — Install GitHub Desktop

This is the friendly version of "git" — no terminal commands, just buttons.

1. Open [desktop.github.com](https://desktop.github.com).
2. Download for macOS, open the `.dmg`, drag GitHub Desktop into Applications.
3. Open it from Applications. It'll ask you to sign in to GitHub — you'll do that in Part 2.

---

## Part 2 — put the project on GitHub (10 min)

### 2.1 — Sign up for GitHub

If you don't already have an account:

1. Go to [github.com/signup](https://github.com/signup).
2. Enter your email, pick a username (you'll see this in URLs), pick a password. Skip the personalization stuff at the end — just say "Continue for free".
3. Verify your email (they'll send a code).

### 2.2 — Move the project to a stable place

Right now the FitMatch files are in a temporary Claude folder, which can change between sessions. Let's copy them somewhere more permanent.

1. Open the **Finder**.
2. From the menu bar: **Go → Go to Folder…** (or press ⌘+Shift+G).
3. Paste this exact path and press Enter:
   ```
   ~/Library/Application Support/Claude/local-agent-mode-sessions/02f57496-bc4e-4ad6-b7f2-5199dddadc37/17f3a485-b102-469e-bd8f-a346147802a3/local_fc79de42-8023-4d5a-bd78-dc19b67136cf/outputs
   ```
4. You should see a folder called `pt-marketplace`. Drag it to your **Documents** folder.
5. Rename it to `fitmatch` if you like (right-click → Rename).

You should now have `~/Documents/fitmatch` with all the project files inside.

### 2.3 — Publish it to GitHub via GitHub Desktop

1. Open **GitHub Desktop**.
2. If it asks you to sign in: click **Sign in to GitHub.com**, follow the browser flow, click **Authorize**.
3. From the menu bar: **File → Add Local Repository…**
4. Click **Choose…** and pick the `fitmatch` folder in your Documents.
5. GitHub Desktop will say "this directory does not appear to be a Git repository" — click the link that says **"create a repository"**.
6. In the dialog:
   - Name: `fitmatch`
   - Description: leave blank or write whatever
   - Local path: leave as-is
   - Tick **Initialize this repository with a README** — actually **untick** it (we already have a README).
   - Git ignore: leave as **None** (we already have one).
   - License: leave as **None**.
   - Click **Create Repository**.
7. You'll now see a list of all the project files in the left panel. At the bottom-left, type a "Summary" like `Initial commit` and click **Commit to main**.
8. At the top, click the big blue **Publish repository** button.
9. In the popup: untick **Keep this code private** if you want it public, otherwise leave it ticked. Click **Publish Repository**.

**✅ Checkpoint:** Open [github.com](https://github.com) in a browser. Click your profile picture (top right) → Your repositories. You should see `fitmatch`. Click into it — you'll see all the project files, including `README.md`, `prisma/`, `src/`, etc.

> **Important sanity check:** scroll the file list and confirm there's no `.env` file in there. If there is, message me — we need to fix it before going further (it would expose secrets, even though right now those secrets are placeholders).

---

## Part 3 — make a database (5 min)

### 3.1 — Sign up for Neon

1. Go to [neon.tech](https://neon.tech) and click **Sign up**.
2. Sign up with GitHub (easiest) — it'll just ask you to authorize.
3. After signup it'll ask you to create a project:
   - **Project name:** `fitmatch` (or whatever)
   - **Postgres version:** leave as default
   - **Region:** pick the one closest to you (e.g. *AWS Europe (London)* if you're in the UK)
   - Click **Create project**.

### 3.2 — Copy the connection string

After the project is created, you'll see a "Connection Details" panel.

1. Make sure the dropdown says **Pooled connection** (not "Direct"). This matters — Vercel needs the pooled one.
2. Click the eye icon to reveal the password.
3. Click the **copy** button on the connection string.
4. Paste it somewhere safe temporarily (a Notes app, anywhere). It looks like:
   ```
   postgresql://neondb_owner:abc123XYZ@ep-cool-name-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

That's your `DATABASE_URL`. We'll paste it into Vercel in a moment.

---

## Part 4 — make a "secret key" (1 min)

Vercel needs a random string to sign login cookies safely.

1. Open Terminal again (⌘+space → "Terminal").
2. Paste this and press Enter:
   ```bash
   openssl rand -base64 48
   ```
3. Copy the output (a long string of random characters). Save it next to your database URL.

That's your `AUTH_SECRET`. Don't share it with anyone.

---

## Part 5 — deploy to Vercel (5 min)

### 5.1 — Sign up for Vercel

1. Go to [vercel.com/signup](https://vercel.com/signup).
2. Click **Continue with GitHub** — easiest because it's already linked to your code.
3. Click **Authorize Vercel**.
4. Pick the **Hobby (free)** plan when asked. You don't need a team.

### 5.2 — Import the project

1. After signup you'll land on a page asking to "Import Git Repository". You should see your `fitmatch` repo in the list.
   - If you don't see it: click **Adjust GitHub App Permissions** → tick `fitmatch` → save.
2. Click **Import** next to `fitmatch`.

### 5.3 — Configure it

You'll see a settings screen. Most of it is right by default — only one thing to change.

1. Scroll down to **Environment Variables**. Add these two — for each one, type the name and paste the value, then click **Add**:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon connection string from Part 3 |
   | `AUTH_SECRET` | the random string from Part 4 |

2. Leave everything else (Framework Preset, Build Command, etc.) as-is.
3. Click **Deploy**.

### 5.4 — Wait

The first deploy takes about 90 seconds. You'll see a fireworks animation when it's ready.

**✅ Checkpoint:** Click the screenshot of your site, or click **Continue to Dashboard**. At the top you'll see your URL — something like `fitmatch-philco.vercel.app`. Click it.

You'll get an **error page** — that's expected! The website is live but the database is still empty. We fix that in Part 6.

---

## Part 6 — fill the database (3 min)

This is the only Terminal-heavy part. You're going to copy-paste 3 commands.

1. Open **Terminal** again.
2. Move into the project folder:
   ```bash
   cd ~/Documents/fitmatch
   ```
3. Open the `.env` file in TextEdit so you can paste your real Neon URL into it:
   ```bash
   open -e .env
   ```
   You'll see two lines starting with `DATABASE_URL=` and `AUTH_SECRET=`.
   - Replace the long fake `DATABASE_URL` value (the bit between the quotes) with the real Neon URL you saved earlier.
   - Replace the `AUTH_SECRET` value with the random string you generated.
   - **Save the file** (⌘+S) and close TextEdit.

4. Back in Terminal, run these commands one at a time. After each one, wait for it to finish (you'll see your prompt come back) before running the next:

   ```bash
   npm install
   ```
   *(takes 30–60 seconds — installs the parts needed to set up the database)*

   ```bash
   npx prisma db push
   ```
   *(creates the empty tables in Neon — should take ~5 seconds)*

   ```bash
   npm run db:seed
   ```
   *(loads 12 sample PTs and the admin user — takes ~2 seconds)*

**✅ Checkpoint:** the last command should print:
```
Seeding database…
  ✓ Admin: admin@fitmatch.dev / admin123
  ✓ 12 trainers (password for all: password123)
Done.
```

---

## Part 7 — try it! (1 min)

Go back to your `*.vercel.app` URL and refresh. You should now see:

- The landing page with the hero and three featured trainers.
- A working **Start the quiz** button leading to the 5-step quiz.
- After the quiz, three matched trainer cards.

**Try the admin dashboard:**
- Visit `https://your-url.vercel.app/admin/login`.
- Log in with `admin@fitmatch.dev` / `admin123`.
- You'll see the admin panel — try approving "Sam Pending" and watch them appear in the list of live trainers.

🎉 **You've shipped a real website.**

---

## What if something breaks?

### "Terminal says 'command not found' for `npm` or `node`"
Node.js isn't fully installed. Try restarting Terminal first. If that doesn't work, restart your Mac. Still nothing? Re-run the Node installer from Part 1.1.

### "GitHub Desktop won't let me publish"
Make sure you're signed in (gear icon → Preferences → Accounts).

### "Vercel build failed"
Click into the failed deploy → **Build Logs**. The error is usually near the bottom in red. Copy the last 10 lines and message me — I'll help debug.

### "I can see the site but the quiz returns nothing"
The database isn't seeded. Re-run Part 6, paying attention to the `.env` file — make sure the `DATABASE_URL` is your real Neon URL, not the placeholder.

### "I forgot my Neon URL / generated `AUTH_SECRET`"
- Neon: log into [console.neon.tech](https://console.neon.tech), pick your project, click *Connection Details*, copy again.
- `AUTH_SECRET`: just generate a new one with `openssl rand -base64 48` and update it in **both** `.env` (locally) and the Vercel dashboard (Project → Settings → Environment Variables → edit, then redeploy).

---

## What you can do next

- **Add a custom domain.** Vercel → your project → Settings → Domains. Buy a domain on [Cloudflare](https://www.cloudflare.com/products/registrar/) (~£8/year) and follow Vercel's instructions to point it.
- **Edit a trainer's profile.** Log in to `/pt/login` as e.g. `aisha@fitmatch.dev` / `password123` and try the profile editor.
- **Change the seed data.** Edit `prisma/seed.js`, then re-run Part 6 step 4 (just `npm run db:seed`). Existing accounts won't be overwritten.
- **Make code changes.** Edit any file, save, then in GitHub Desktop: write a summary, click **Commit to main**, click **Push origin**. Vercel auto-redeploys in ~60 seconds.

That last one is genuinely cool — every time you push, your live website updates within a minute.
