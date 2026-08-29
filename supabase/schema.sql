-- BookIt database schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query -> paste -> Run)

create extension if not exists pgcrypto;

-- A restaurant listing
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cuisine text,
  city text not null,
  address text,
  price_range smallint check (price_range between 1 and 4),
  cover_photo_url text,
  created_at timestamptz not null default now()
);

-- Extra photos for a restaurant's gallery
create table restaurant_photos (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

-- Menu items for a restaurant
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2),
  category text,
  created_at timestamptz not null default now()
);

-- Bookable time slots the admin sets per restaurant (e.g. "Aug 30, 8:00 PM, capacity 6")
create table availability_slots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  slot_date date not null,
  slot_time time not null,
  capacity int not null default 0,
  booked_count int not null default 0,
  created_at timestamptz not null default now()
);

-- A customer's booking against a slot (unused until Phase 4, but created now so the schema is stable)
create table reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  slot_id uuid not null references availability_slots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  party_size int not null default 1,
  status text not null default 'confirmed' check (status in ('confirmed', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Customer reviews (unused until Phase 5)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Row Level Security: by default, nobody can read/write a table once RLS is on,
-- until a policy explicitly allows it. This is Supabase/Postgres's access-control system.
alter table restaurants enable row level security;
alter table restaurant_photos enable row level security;
alter table menu_items enable row level security;
alter table availability_slots enable row level security;
alter table reservations enable row level security;
alter table reviews enable row level security;

-- Anyone (even logged-out visitors) can browse restaurants, photos, menus, availability, and reviews.
create policy "Public can view restaurants" on restaurants for select using (true);
create policy "Public can view restaurant photos" on restaurant_photos for select using (true);
create policy "Public can view menu items" on menu_items for select using (true);
create policy "Public can view availability" on availability_slots for select using (true);
create policy "Public can view reviews" on reviews for select using (true);

-- No policies on reservations yet on purpose: writes stay locked down until
-- Phase 3 (auth) and Phase 4 (booking flow) add the right policies.

-- Phase 3: customer accounts -------------------------------------------

-- Extra profile info per user. Supabase manages auth.users itself (email,
-- phone, password hash, etc.) -- app-specific fields like a display name
-- live here instead, linked 1:1 to the auth user.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Automatically create a profile row whenever someone signs up, copying
-- full_name/phone out of the metadata passed to supabase.auth.signUp().
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
