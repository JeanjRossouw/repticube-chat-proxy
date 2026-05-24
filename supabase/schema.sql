-- ============================================
-- ReptiCube Tracker — Database Schema
-- Paste this entire file into Supabase SQL Editor and run.
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  role text not null default 'owner' check (role in ('owner', 'helper')),
  created_at timestamptz not null default now()
);

create table public.stickers (
  qr_code text primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  snake_id uuid,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.snakes (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  sticker_qr text references public.stickers(qr_code) on delete set null,
  name text not null,
  species text not null,
  morph text,
  sex text check (sex in ('M', 'F', '')),
  hatch_date date,
  acquired_date date,
  source text,
  prey_type text default 'Mouse',
  prey_size text default 'Adult',
  feed_interval_days integer default 7,
  photo_url text,
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feedings (
  id uuid primary key default uuid_generate_v4(),
  snake_id uuid references public.snakes(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  prey_type text,
  prey_size text,
  accepted boolean not null default true,
  regurgitated boolean not null default false,
  next_due date,
  notes text,
  created_at timestamptz not null default now()
);

create table public.weights (
  id uuid primary key default uuid_generate_v4(),
  snake_id uuid references public.snakes(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  grams numeric(8,2) not null,
  condition text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.pairings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  male_id uuid references public.snakes(id) on delete cascade not null,
  female_id uuid references public.snakes(id) on delete cascade not null,
  date date not null,
  lock_observed boolean not null default false,
  lock_duration_minutes integer,
  expected_ovulation date,
  expected_lay_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default uuid_generate_v4(),
  snake_id uuid references public.snakes(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  type text not null check (type in ('shed', 'vet', 'note', 'photo', 'health', 'breeding')),
  description text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Add FK from stickers to snakes (separate to avoid circular dep at creation)
alter table public.stickers
  add constraint stickers_snake_id_fkey
  foreign key (snake_id) references public.snakes(id) on delete set null;

-- ============================================
-- INDEXES
-- ============================================
create index idx_snakes_owner on public.snakes(owner_id) where archived = false;
create index idx_feedings_snake_date on public.feedings(snake_id, date desc);
create index idx_weights_snake_date on public.weights(snake_id, date desc);
create index idx_pairings_owner on public.pairings(owner_id);
create index idx_events_snake on public.events(snake_id, date desc);
create index idx_stickers_owner on public.stickers(owner_id);

-- ============================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger snakes_updated_at
  before update on public.snakes
  for each row execute function public.update_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- Users can only see and modify their own data.
-- ============================================
alter table public.profiles enable row level security;
alter table public.stickers enable row level security;
alter table public.snakes enable row level security;
alter table public.feedings enable row level security;
alter table public.weights enable row level security;
alter table public.pairings enable row level security;
alter table public.events enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Stickers
create policy "Users can view own stickers" on public.stickers
  for select using (auth.uid() = owner_id);
create policy "Users can insert own stickers" on public.stickers
  for insert with check (auth.uid() = owner_id);
create policy "Users can update own stickers" on public.stickers
  for update using (auth.uid() = owner_id);
create policy "Users can delete own stickers" on public.stickers
  for delete using (auth.uid() = owner_id);

-- Snakes
create policy "Users can view own snakes" on public.snakes
  for select using (auth.uid() = owner_id);
create policy "Users can insert own snakes" on public.snakes
  for insert with check (auth.uid() = owner_id);
create policy "Users can update own snakes" on public.snakes
  for update using (auth.uid() = owner_id);
create policy "Users can delete own snakes" on public.snakes
  for delete using (auth.uid() = owner_id);

-- Feedings (apply same pattern)
create policy "Users own feedings" on public.feedings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Weights
create policy "Users own weights" on public.weights
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Pairings
create policy "Users own pairings" on public.pairings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Events
create policy "Users own events" on public.events
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ============================================
-- DONE
-- ============================================
-- Now go to Authentication > Providers and ensure Email is enabled.
-- Optionally enable "Confirm email" off for faster testing.
