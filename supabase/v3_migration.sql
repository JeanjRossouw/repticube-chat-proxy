-- ============================================
-- Repti-Track v0.3 Migration
-- Adds: sold tracking, staff can write snakes & stickers
-- Run AFTER team_migration.sql
-- ============================================

-- Sold tracking columns on snakes
alter table public.snakes add column if not exists sold_at timestamptz;
alter table public.snakes add column if not exists sold_price numeric(10,2);
alter table public.snakes add column if not exists sold_to text;
alter table public.snakes add column if not exists sold_notes text;

-- Loosen RLS: staff can now add/edit/delete reptiles and stickers, and move between facilities
-- (Owner-only restrictions remain on pairings, team management, and facility CRUD)

drop policy if exists "Owner inserts snakes" on public.snakes;
drop policy if exists "Owner updates snakes" on public.snakes;
drop policy if exists "Owner deletes snakes" on public.snakes;
drop policy if exists "Owners can insert snakes" on public.snakes;
drop policy if exists "Owners can update snakes" on public.snakes;
drop policy if exists "Owners can delete snakes" on public.snakes;

create policy "Team inserts snakes" on public.snakes
  for insert with check (team_id in (select user_team_ids()));
create policy "Team updates snakes" on public.snakes
  for update using (team_id in (select user_team_ids()));
create policy "Team deletes snakes" on public.snakes
  for delete using (team_id in (select user_team_ids()));

-- Stickers — staff can now generate batches
drop policy if exists "Owner manages stickers" on public.stickers;
drop policy if exists "Owners manage stickers" on public.stickers;

create policy "Team manages stickers" on public.stickers
  for all using (team_id in (select user_team_ids()))
  with check (team_id in (select user_team_ids()));
