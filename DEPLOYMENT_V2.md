# ReptiCube v0.2 — Multi-User Deployment

This update adds:
- Team-based access with Winkel, Fabriek, Huis facilities
- Email invite flow for staff
- Audit trail (who logged each feeding/weight)
- Push notifications (daily 8am feeding reminders)

## Deployment Steps

### 1. Run database migration in Supabase

Go to Supabase Dashboard → SQL Editor → New Query.

Copy the **entire contents** of `supabase/team_migration.sql` and run it.

What it does:
- Creates `teams`, `team_members`, `team_invitations`, `facilities`, `push_subscriptions` tables
- Adds `team_id`, `facility_id`, `logged_by` columns to existing tables
- Creates a team called "My Collection" for you (with Winkel/Fabriek/Huis facilities)
- Assigns all existing reptiles to your team, defaults their facility to Winkel
- Rewrites RLS policies for team-based access

After running, verify with these queries:
```sql
select count(*) from teams;          -- should be 1
select * from facilities;            -- should show Winkel, Fabriek, Huis
select count(*) from team_members;   -- should be 1 (you as owner)
```

If something goes wrong, you can roll back by restoring from a Supabase backup. **Take a backup before running** (Supabase → Database → Backups).

### 2. Add environment variables in Vercel

Go to Vercel → repticube-tracker → Settings → Environment Variables.

Add these **three new** variables (your existing ones stay):

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BCrUHZJxTqAfdFxR1oLIv5BEPOZfhzIafnDSTOGgkKCGBpUuTh4FEH7JZYkf1zvH0p9gH4j5v09ysKHoqs2IXTw
VAPID_PRIVATE_KEY=vQH_yyUOgNdzMuR8WArgtMNoOmPBWumsOr_pC8TmYf0
VAPID_SUBJECT=mailto:repticube@gmail.com
```

You also need the **Supabase Service Role Key** for the cron job to read across users. Get it from Supabase → Project Settings → API → `service_role` key (secret, very long string).

```
SUPABASE_SERVICE_ROLE_KEY=<paste the service_role key>
```

Optional security for the cron endpoint:
```
CRON_SECRET=<any random 32-char string>
```

⚠️ Keep `VAPID_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET` private. Never commit to git. They're only in Vercel env vars.

### 3. Push the code to GitHub

In Command Prompt:

```
cd "C:\Users\Jean Rossouw\Downloads\repticube-tracker\repticube-tracker"
git add .
git commit -m "Multi-user with facilities + push notifications"
git push
```

Vercel will auto-deploy in 2-3 minutes.

### 4. Test it

1. Visit https://repticube.app — your own account works as Owner
2. Go to Settings → "Manage staff & facilities"
3. Invite a staff member by email
4. Copy the invite link and paste it to them (WhatsApp, SMS, email)
5. They open the link, set a password, and join as Staff
6. Test notifications: Settings → "Manage feeding reminders" → "Enable on this device" → "Send test notification"

### 5. iPhone PWA install (important for staff)

If any staff uses iPhone, they must:
1. Open https://repticube.app **in Safari** (not Chrome)
2. Tap Share → "Add to Home Screen"
3. Open the app from the home screen icon
4. Then notifications can be enabled

Without this step, iPhones get NO push notifications.

## How notifications work

- Vercel cron runs daily at 06:00 UTC (= 08:00 SAST)
- Scans every team for reptiles with feedings due today or overdue
- Sends one push per subscribed device with a summary like "3 due today · 2 overdue"
- Tapping the notification opens the Feed page
- Dead/expired subscriptions are auto-cleaned

## Permissions cheat sheet

| Action | Owner | Staff |
|---|---|---|
| View all reptiles | ✅ | ✅ |
| Log feeding/weight | ✅ | ✅ |
| Add reptile | ✅ | ❌ |
| Delete reptile | ✅ | ❌ |
| Edit reptile details | ✅ | ❌ |
| See pairings/breeding | ✅ | ❌ |
| Manage stickers | ✅ | ❌ |
| Invite/remove staff | ✅ | ❌ |
| Receive notifications | ✅ | ✅ |
| See audit trail | ✅ | ✅ |
