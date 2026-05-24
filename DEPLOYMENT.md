# Deployment guide — ReptiCube Tracker

Step-by-step from zero to live app at `repticube.app`. Roughly 45-60 minutes total.

---

## Prerequisites (free, all of them)

- A computer with Node.js 18+ installed → https://nodejs.org
- A GitHub account → https://github.com/signup
- A Supabase account → https://supabase.com (sign up with GitHub)
- A Vercel account → https://vercel.com (sign up with GitHub)
- Domain `repticube.app` purchased (Namecheap, Cloudflare Registrar, etc.)

---

## STEP 1 — Set up Supabase (10 min)

1. Go to https://supabase.com/dashboard and click **New Project**.
2. Choose a name (e.g. "repticube-tracker"), set a strong database password, pick the region closest to South Africa (typically **eu-west-1** or **eu-central-1**).
3. Wait ~2 min for provisioning.
4. Once ready, in the left sidebar click **SQL Editor** → **New query**.
5. Open `supabase/schema.sql` from this project, copy the entire contents, paste into the SQL editor, click **Run** (bottom right).
6. You should see "Success. No rows returned." Tables are now created.
7. In the left sidebar click **Authentication → Providers**. Email is enabled by default.
8. For faster testing, toggle off **"Confirm email"** under Email provider (you can re-enable later for production).
9. In the left sidebar click **Project Settings (gear icon) → API**. Copy these two values, you'll need them:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public** key (the long one starting with `eyJ...`)

---

## STEP 2 — Run locally (10 min)

This is to confirm everything works before deploying.

```bash
# In your terminal, navigate to this folder
cd repticube-tracker

# Install dependencies (takes ~2 min)
npm install

# Create your local environment file
cp .env.local.example .env.local
```

Open `.env.local` in any text editor and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Save the file, then:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. You should see the login screen.

**Test it:**
1. Click "Don't have an account? Sign up"
2. Use any email + password (6+ chars)
3. Sign up, then sign in
4. Go to Settings (bottom right) → Manage stickers → generate 5
5. Click the green Scan button → Type code mode → enter one of your codes
6. Fill in a test snake
7. Log a feeding, log a weight

If all that works, you're ready to deploy.

Press `Ctrl+C` in terminal to stop the local server.

---

## STEP 3 — Push to GitHub (5 min)

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create new repo on GitHub at https://github.com/new
# Name it: repticube-tracker
# Keep it PRIVATE
# Don't initialize with anything (no README, no gitignore)

# Then back in terminal (replace YOUR-USERNAME):
git remote add origin https://github.com/YOUR-USERNAME/repticube-tracker.git
git branch -M main
git push -u origin main
```

If you get auth errors, GitHub now requires a Personal Access Token instead of password. Easiest: install GitHub Desktop (https://desktop.github.com) and let it handle auth.

---

## STEP 4 — Deploy to Vercel (10 min)

1. Go to https://vercel.com/new
2. Click **Import** next to your `repticube-tracker` GitHub repo (grant Vercel access if asked)
3. Framework Preset: **Next.js** (auto-detected)
4. Expand **Environment Variables** and add these three:
   ```
   NEXT_PUBLIC_SUPABASE_URL   = https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   NEXT_PUBLIC_APP_URL = https://repticube.app
   ```
   *(Use the Vercel-provided URL initially if your domain isn't connected yet — you can update this later.)*
5. Click **Deploy**. Wait ~2 min.
6. You'll get a URL like `https://repticube-tracker-abc123.vercel.app`.
7. Open it on your phone — sign up, test it works.

---

## STEP 5 — Connect repticube.app domain (10 min)

1. In Vercel project → **Settings → Domains**
2. Type `repticube.app` and click **Add**
3. Vercel will show you DNS records to add — typically:
   - `A` record → `76.76.21.21`
   - Or `CNAME` for `www.repticube.app` → `cname.vercel-dns.com`
4. Go to wherever you bought the domain (Namecheap/Cloudflare/etc.) and add those records to your domain's DNS settings
5. Wait 5-30 min for DNS to propagate
6. Vercel auto-provisions SSL — you'll see green ticks when ready
7. Back in Vercel Project → **Settings → Environment Variables**, update `NEXT_PUBLIC_APP_URL` to `https://repticube.app`
8. Trigger a redeploy: **Deployments → ... menu on latest → Redeploy**

---

## STEP 6 — Add Supabase auth callback URL (2 min)

In Supabase dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://repticube.app`
- **Redirect URLs**: add `https://repticube.app/**`

Save. This lets email confirmation links work correctly.

---

## STEP 7 — Install on your phone (1 min)

1. Open `https://repticube.app` on your phone
2. Sign in
3. **iPhone**: Share button → "Add to Home Screen"
4. **Android**: Menu → "Install app" or "Add to home screen"
5. Now it opens fullscreen like a real app

---

## You're live. Here's how to use it.

### Initial setup workflow
1. Open app → Settings → Manage stickers
2. Generate a batch of 50 stickers
3. Click "Open print sheet" → Print
4. Cut them up, stick one on each snake's enclosure
5. Walk around with your phone, scan each one, fill in the snake details

### Daily workflow
1. Open app — home screen shows which snakes are due to feed
2. Tap a snake → Feeding tab → Log feeding
3. Done. Next feed date auto-calculated.

### Weighing
1. Tap snake → Weight tab → Log weight
2. After 2+ entries you get a growth chart

### Pairings
1. Bottom nav → Pairings → New pairing
2. Select male, female, date, whether lock was observed

---

## Troubleshooting

**"Failed to fetch" / auth errors**
- Check `.env.local` values exactly match Supabase API settings
- After changing env vars in Vercel, you must redeploy

**Camera doesn't work on iPhone**
- Must use HTTPS (won't work on `http://localhost` on phone)
- iOS requires the page be served via Safari, not in-app browsers (Instagram, etc.)
- If it still fails, use the "Type code" tab as fallback

**QR scan opens to "Sticker not found"**
- The sticker code was scanned correctly but isn't in your database
- Each user has their own stickers — make sure you're signed in to the account that generated them

**I want to add a helper account**
- Currently each account is independent — multi-user sharing is in the roadmap
- For now: share login credentials with your one trusted helper, or sign in on their phone using your account

---

## Updating the app later

When you want to add features or fix bugs:

```bash
# Make your changes locally, test with npm run dev
git add .
git commit -m "describe what you changed"
git push
```

Vercel auto-deploys on every push to `main`. ~1-2 min later it's live.

---

## Costs to watch

Free tier limits (you're well within these):
- **Vercel**: 100GB bandwidth/month, 100GB-hours functions
- **Supabase**: 500MB database, 2GB bandwidth, 50,000 monthly active users

You won't hit any of these unless you have thousands of users. When you eventually monetize, Vercel Pro is $20/month and Supabase Pro is $25/month.

---

## What to build next

Once you've used this for 2-3 weeks with your actual collection, here's what you'll likely want next:

1. **Photo uploads** — snap a pic each weigh-in, see visual progression
2. **Quick re-feed** — one-tap "log same as last feeding"
3. **Egg/clutch tracking** — separate table for breeding outcomes
4. **Care reminders** — push notifications for overdue feedings
5. **Helper accounts** — separate logins for family/staff with limited permissions

When you're ready, share what's working and what isn't, and we'll keep iterating.
