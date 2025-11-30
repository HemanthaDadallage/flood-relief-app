-- Supabase schema for the Flood relief app
-- Run in the Supabase SQL editor or via `supabase db remote commit`

-- Helpers
create extension if not exists "pgcrypto";

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from admin_profiles ap
    where ap.id = user_id
      and ap.role = 'admin'
  );
$$;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'request_status') then
    create type public.request_status as enum ('open', 'in_progress', 'completed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'urgency_level') then
    create type public.urgency_level as enum ('high', 'medium', 'low');
  end if;

  if not exists (select 1 from pg_type where typname = 'volunteer_status') then
    create type public.volunteer_status as enum ('available', 'busy', 'inactive');
  end if;
end $$;

create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_info text not null,
  location text not null,
  type_of_help text[] not null default '{}'::text[],
  availability text,
  status public.volunteer_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact_info text not null,
  location text not null,
  type_of_need text not null,
  description text,
  urgency public.urgency_level not null default 'medium',
  status public.request_status not null default 'open',
  assigned_volunteer_id uuid references public.volunteers(id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists help_requests_created_at_idx on public.help_requests (created_at desc);
create index if not exists help_requests_location_idx on public.help_requests (location);
create index if not exists help_requests_status_idx on public.help_requests (status);
create index if not exists volunteers_location_idx on public.volunteers (location);
create index if not exists volunteers_status_idx on public.volunteers (status);

-- RLS
alter table public.help_requests enable row level security;
alter table public.volunteers enable row level security;
alter table public.admin_profiles enable row level security;

-- Policies: drop if they exist so this script is repeatable
drop policy if exists "public can create help_requests" on public.help_requests;
drop policy if exists "public can create volunteers" on public.volunteers;
drop policy if exists "admins can read help_requests" on public.help_requests;
drop policy if exists "admins can update help_requests" on public.help_requests;
drop policy if exists "admins can read volunteers" on public.volunteers;
drop policy if exists "admins can update volunteers" on public.volunteers;
drop policy if exists "admins can manage admin_profiles" on public.admin_profiles;

-- Policies: public submission
create policy "public can create help_requests" on public.help_requests
  for insert
  to anon
  with check (true);

create policy "public can create volunteers" on public.volunteers
  for insert
  to anon
  with check (true);

-- Policies: admins can read/update
create policy "admins can read help_requests" on public.help_requests
  for select
  using (is_admin(auth.uid()));

create policy "admins can update help_requests" on public.help_requests
  for update
  using (is_admin(auth.uid()));

create policy "admins can read volunteers" on public.volunteers
  for select
  using (is_admin(auth.uid()));

create policy "admins can update volunteers" on public.volunteers
  for update
  using (is_admin(auth.uid()));

create policy "admins can manage admin_profiles" on public.admin_profiles
  for all
  using (is_admin(auth.uid()));

-- Triggers to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_help_requests_updated_at') then
    create trigger set_help_requests_updated_at
      before update on public.help_requests
      for each row execute procedure public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_volunteers_updated_at') then
    create trigger set_volunteers_updated_at
      before update on public.volunteers
      for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- Seed an admin profile manually after creating an auth user:
-- insert into public.admin_profiles (id, role) values ('<auth-user-uuid>', 'admin');
