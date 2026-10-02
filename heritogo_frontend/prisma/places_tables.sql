-- Tables catalogue (à exécuter via le pooler ou l'éditeur SQL Supabase)

create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  history text not null,
  region text not null,
  locality text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  image_url text not null,
  is_unesco boolean not null default false,
  is_published boolean not null default true,
  best_time text,
  duration text,
  outfit text,
  access_info text,
  fee text,
  related_dish_slugs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dishes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  history text not null,
  accompaniments text,
  category text not null,
  region text,
  image_url text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table places enable row level security;
alter table dishes enable row level security;

drop policy if exists "Public read published places" on places;
create policy "Public read published places"
on places for select
using (is_published = true);

drop policy if exists "Public read published dishes" on dishes;
create policy "Public read published dishes"
on dishes for select
using (is_published = true);

drop policy if exists "Authenticated manage places" on places;
create policy "Authenticated manage places"
on places for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated manage dishes" on dishes;
create policy "Authenticated manage dishes"
on dishes for all
to authenticated
using (true)
with check (true);
