# ReptiCube Tracker

A Progressive Web App for tracking your snake collection — feeding, weights, pairings, and QR sticker management. Built with Next.js, Supabase, and deployed on Vercel.

## What's in this folder

```
repticube-tracker/
├── src/                    # All application code
│   ├── app/                # Next.js pages (routes)
│   ├── components/         # Shared UI components
│   ├── lib/                # Supabase clients, utils, types
│   └── middleware.ts       # Auth route protection
├── public/                 # Static files (icons, manifest)
├── supabase/
│   └── schema.sql          # Database schema — paste into Supabase
├── package.json            # Dependencies
├── .env.local.example      # Environment variable template
└── DEPLOYMENT.md           # Step-by-step deployment guide
```

## Quick start (5 minutes to test locally)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys (see DEPLOYMENT.md)

# 3. Run database schema in Supabase SQL editor
# Copy contents of supabase/schema.sql

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000
```

## Full deployment

See `DEPLOYMENT.md` for the complete walkthrough (GitHub → Vercel → Supabase → custom domain).

## Tech stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Database**: Supabase (Postgres + Auth + Row Level Security)
- **QR**: `qrcode` for generation, `html5-qrcode` for scanning
- **Hosting**: Vercel (free tier)
- **PWA**: Installable on iOS/Android, works offline-light

## Cost at your scale (50-200 snakes)

- Vercel: **R0/month** (free tier covers it for years)
- Supabase: **R0/month** (free tier handles thousands of users)
- Custom domain: ~R150/year for `.app` TLD

Total: under R200/year.

## Features

- **QR sticker workflow**: pre-print batch → scan to assign → stays linked forever
- **Snake records**: name, species, morph, sex, hatch date, source, prey, intervals
- **Feeding log**: auto-calculates next due date, tracks refused/regurged
- **Weight tracking**: auto-builds growth chart from logged weights
- **Pairings**: log breeding pairs, lock observations
- **Print sheets**: generate printable QR sticker sheets (3-up grid)
- **Auth**: email/password, row-level security so users only see their own data
- **PWA**: install on phone home screen, opens fullscreen like a native app

## Next steps (not in MVP)

- Photo uploads (Supabase Storage)
- Helper accounts (share collection with family/staff)
- Egg/clutch tracking
- Reminders / push notifications
- Public scan view (scanning unowned sticker shows care info, not records)
- Multi-tenant SaaS billing
