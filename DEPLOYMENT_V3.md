# Repti-Track v0.3 Deployment

This update adds:
- 🦎 Rebrand: "ReptiCube Tracker" → **Repti-Track**, new gecko logo + wordmark
- 💰 **Mark as sold** flow with sale price, buyer, notes (auto-archives)
- 🚚 **Move between facilities** — Winkel ↔ Fabriek ↔ Huis
- 👥 **Staff = Owner** for reptile management (add, edit, delete, move, sell)
- 🦗 **Smart prey sizes** — Crickets/Dubia/Mealworms now use 3 day, 7 day, Sm, Med, Lg, Adult
- 🥣 **Food tab** for geckos & lizards — log Pangea, Ultimate Exotics, Urban Gecko, Repashy as feedings (counts toward next-due)

## Deployment — 3 steps

### 1. Run the v3 SQL migration in Supabase

Supabase Dashboard → SQL Editor → New Query → paste contents of `supabase/v3_migration.sql` → Run.

What it does:
- Adds `sold_at`, `sold_price`, `sold_to`, `sold_notes` columns to `snakes`
- Rewrites RLS so staff can also insert/update/delete snakes & stickers (was owner-only)

Tip: Backup first via Supabase → Database → Backups.

### 2. Push code to GitHub

```
cd "C:\Users\Jean Rossouw\Downloads\repticube-tracker\repticube-tracker"
git add .
git commit -m "v0.3 — Repti-Track rebrand, sold/move flow, food tab, smart insect sizing"
git push
```

Vercel will auto-deploy in ~3 minutes.

### 3. Reinstall PWA on phone

Since the app icon and name changed:
- **Android:** Open https://repticube.app → menu (⋮) → "Add to Home screen" → confirm name "Repti-Track"
- **iPhone:** Same as before — Safari → Share → "Add to Home Screen"

The old icon (placeholder) will still work, but you might want to delete and reinstall for the fresh gecko icon.

## What changed for users

**Owner:** No change to permissions. Same powers.

**Staff:** Now equals owner for reptile work:
- Can add reptiles
- Can edit reptiles
- Can delete reptiles
- Can move reptiles between facilities
- Can mark reptiles as sold
- Can manage stickers
- Still cannot: see pairings/breeding, invite/remove team members, manage facilities

**Both:** New Food tab on gecko/lizard pages for CGD/porridge tracking.

## Quick test after deploy

1. Open any reptile → scroll to "Actions" → see new Move/Sell/Delete buttons
2. Pick a gecko → look for the Food tab → tap → log a Pangea feeding
3. In feed log, pick Crickets — verify the size dropdown now shows "3 day, 7 day, Small, Medium, Large, Adult"
4. Pick Mice — verify it still shows "Pinky, Fuzzy, Hopper..."

If anything's off, screenshot it and I'll fix it.
