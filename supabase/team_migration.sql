-- ============================================
-- ReptiCube Tracker — Multi-User v2 Migration
-- Run AFTER schema.sql and species_data.sql
-- ============================================

-- TABLES

create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('owner', 'staff')) default 'staff',
  created_at timestamptz not null default now(),
  unique(team_id, user_id)
);

create table public.team_invitations (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade not null,
  email text not null,
  role text not null check (role in ('staff')) default 'staff',
  invited_by uuid references public.profiles(id) on delete set null,
  token text unique not null,
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.facilities (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  team_id uuid references public.teams(id) on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique(endpoint)
);

create index idx_team_members_user on public.team_members(user_id);
create index idx_team_members_team on public.team_members(team_id);
create index idx_invitations_token on public.team_invitations(token);
create index idx_invitations_email on public.team_invitations(email);
create index idx_facilities_team on public.facilities(team_id);
create index idx_push_subs_user on public.push_subscriptions(user_id);

-- ADD TEAM/FACILITY/AUDIT COLUMNS TO EXISTING TABLES

alter table public.snakes add column if not exists team_id uuid references public.teams(id) on delete cascade;
alter table public.snakes add column if not exists facility_id uuid references public.facilities(id) on delete set null;
alter table public.stickers add column if not exists team_id uuid references public.teams(id) on delete cascade;
alter table public.feedings add column if not exists team_id uuid references public.teams(id) on delete cascade;
alter table public.feedings add column if not exists logged_by uuid references public.profiles(id) on delete set null;
alter table public.weights add column if not exists team_id uuid references public.teams(id) on delete cascade;
alter table public.weights add column if not exists logged_by uuid references public.profiles(id) on delete set null;
alter table public.pairings add column if not exists team_id uuid references public.teams(id) on delete cascade;
alter table public.events add column if not exists team_id uuid references public.teams(id) on delete cascade;
alter table public.events add column if not exists logged_by uuid references public.profiles(id) on delete set null;

create index if not exists idx_snakes_team on public.snakes(team_id);
create index if not exists idx_snakes_facility on public.snakes(facility_id);
create index if not exists idx_feedings_team on public.feedings(team_id);
create index if not exists idx_weights_team on public.weights(team_id);

-- HELPER FUNCTIONS

create or replace function public.user_team_ids()
returns setof uuid language sql security definer stable as $$
  select team_id from public.team_members where user_id = auth.uid()
$$;

create or replace function public.user_is_owner(target_team_id uuid)
returns boolean language sql security definer stable as $$
  select exists(
    select 1 from public.team_members
    where user_id = auth.uid()
      and team_id = target_team_id
      and role = 'owner'
  )
$$;

-- BACKFILL: create team + facilities for existing owner, migrate data

do $$
declare
  prof record;
  new_team_id uuid;
  winkel_id uuid;
begin
  for prof in select id from public.profiles loop
    if not exists (select 1 from public.teams where owner_id = prof.id) then
      insert into public.teams (owner_id, name)
      values (prof.id, 'My Collection')
      returning id into new_team_id;

      insert into public.team_members (team_id, user_id, role)
      values (new_team_id, prof.id, 'owner');

      insert into public.facilities (team_id, name, display_order)
      values (new_team_id, 'Winkel', 1)
      returning id into winkel_id;

      insert into public.facilities (team_id, name, display_order) values
        (new_team_id, 'Fabriek', 2),
        (new_team_id, 'Huis', 3);

      -- Migrate existing data
      update public.snakes set team_id = new_team_id, facility_id = winkel_id
        where owner_id = prof.id and team_id is null;
      update public.stickers set team_id = new_team_id where owner_id = prof.id and team_id is null;
      update public.feedings set team_id = new_team_id, logged_by = prof.id
        where owner_id = prof.id and team_id is null;
      update public.weights set team_id = new_team_id, logged_by = prof.id
        where owner_id = prof.id and team_id is null;
      update public.pairings set team_id = new_team_id where owner_id = prof.id and team_id is null;
      update public.events set team_id = new_team_id, logged_by = prof.id
        where owner_id = prof.id and team_id is null;
    end if;
  end loop;
end $$;

alter table public.snakes alter column team_id set not null;
alter table public.feedings alter column team_id set not null;
alter table public.weights alter column team_id set not null;

-- UPDATED SIGNUP TRIGGER: handle invited users vs new owners

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_team_id uuid;
  invite record;
begin
  -- Always create profile
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));

  -- Check for pending invitation by email
  select * into invite from public.team_invitations
  where email = new.email
    and accepted_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if invite.id is not null then
    -- Join existing team as staff
    insert into public.team_members (team_id, user_id, role)
    values (invite.team_id, new.id, 'staff');

    update public.team_invitations set accepted_at = now() where id = invite.id;
  else
    -- Create new team as owner
    insert into public.teams (owner_id, name)
    values (new.id, 'My Collection')
    returning id into new_team_id;

    insert into public.team_members (team_id, user_id, role)
    values (new_team_id, new.id, 'owner');

    insert into public.facilities (team_id, name, display_order) values
      (new_team_id, 'Winkel', 1),
      (new_team_id, 'Fabriek', 2),
      (new_team_id, 'Huis', 3);
  end if;

  return new;
end;
$$;

-- REWRITE RLS POLICIES

-- Drop old single-user policies
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own stickers" on public.stickers;
drop policy if exists "Users can insert own stickers" on public.stickers;
drop policy if exists "Users can update own stickers" on public.stickers;
drop policy if exists "Users can delete own stickers" on public.stickers;
drop policy if exists "Users can view own snakes" on public.snakes;
drop policy if exists "Users can insert own snakes" on public.snakes;
drop policy if exists "Users can update own snakes" on public.snakes;
drop policy if exists "Users can delete own snakes" on public.snakes;
drop policy if exists "Users own feedings" on public.feedings;
drop policy if exists "Users own weights" on public.weights;
drop policy if exists "Users own pairings" on public.pairings;
drop policy if exists "Users own events" on public.events;

-- profiles
create policy "View own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "View teammate profiles" on public.profiles
  for select using (
    exists(
      select 1 from public.team_members tm1
      join public.team_members tm2 on tm1.team_id = tm2.team_id
      where tm1.user_id = auth.uid() and tm2.user_id = profiles.id
    )
  );
create policy "Update own profile" on public.profiles
  for update using (auth.uid() = id);

-- teams
alter table public.teams enable row level security;
create policy "View teams I belong to" on public.teams
  for select using (id in (select user_team_ids()));
create policy "Owner updates team" on public.teams
  for update using (user_is_owner(id));
create policy "Create own team" on public.teams
  for insert with check (owner_id = auth.uid());

-- team_members
alter table public.team_members enable row level security;
create policy "View my team members" on public.team_members
  for select using (team_id in (select user_team_ids()));
create policy "Owner adds members" on public.team_members
  for insert with check (user_is_owner(team_id));
create policy "Owner removes members" on public.team_members
  for delete using (user_is_owner(team_id) and role <> 'owner');

-- team_invitations
alter table public.team_invitations enable row level security;
create policy "View my team invites" on public.team_invitations
  for select using (team_id in (select user_team_ids()));
create policy "Owner creates invites" on public.team_invitations
  for insert with check (user_is_owner(team_id));
create policy "Owner deletes invites" on public.team_invitations
  for delete using (user_is_owner(team_id));
-- Public read by token (for accept invite page)
create policy "Read invite by token" on public.team_invitations
  for select using (true);

-- facilities
alter table public.facilities enable row level security;
create policy "View facilities of my teams" on public.facilities
  for select using (team_id in (select user_team_ids()));
create policy "Owner manages facilities" on public.facilities
  for all using (user_is_owner(team_id)) with check (user_is_owner(team_id));

-- push_subscriptions
alter table public.push_subscriptions enable row level security;
create policy "Manage own push subs" on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- snakes (owner-only writes; team-wide reads)
create policy "Team views snakes" on public.snakes
  for select using (team_id in (select user_team_ids()));
create policy "Owner inserts snakes" on public.snakes
  for insert with check (user_is_owner(team_id));
create policy "Owner updates snakes" on public.snakes
  for update using (user_is_owner(team_id));
create policy "Owner deletes snakes" on public.snakes
  for delete using (user_is_owner(team_id));

-- stickers (owner-only)
create policy "Team views stickers" on public.stickers
  for select using (team_id in (select user_team_ids()));
create policy "Owner manages stickers" on public.stickers
  for all using (user_is_owner(team_id)) with check (user_is_owner(team_id));

-- feedings (staff CAN write)
create policy "Team views feedings" on public.feedings
  for select using (team_id in (select user_team_ids()));
create policy "Team inserts feedings" on public.feedings
  for insert with check (team_id in (select user_team_ids()));
create policy "Owner updates feedings" on public.feedings
  for update using (user_is_owner(team_id));
create policy "Owner deletes feedings" on public.feedings
  for delete using (user_is_owner(team_id));

-- weights (staff CAN write)
create policy "Team views weights" on public.weights
  for select using (team_id in (select user_team_ids()));
create policy "Team inserts weights" on public.weights
  for insert with check (team_id in (select user_team_ids()));
create policy "Owner updates weights" on public.weights
  for update using (user_is_owner(team_id));
create policy "Owner deletes weights" on public.weights
  for delete using (user_is_owner(team_id));

-- events (staff CAN write)
create policy "Team views events" on public.events
  for select using (team_id in (select user_team_ids()));
create policy "Team inserts events" on public.events
  for insert with check (team_id in (select user_team_ids()));
create policy "Owner updates events" on public.events
  for update using (user_is_owner(team_id));
create policy "Owner deletes events" on public.events
  for delete using (user_is_owner(team_id));

-- pairings (owner-only — staff cannot see breeding)
create policy "Owner views pairings" on public.pairings
  for select using (user_is_owner(team_id));
create policy "Owner manages pairings" on public.pairings
  for all using (user_is_owner(team_id)) with check (user_is_owner(team_id));
