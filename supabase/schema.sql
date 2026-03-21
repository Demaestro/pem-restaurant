create table if not exists public.orders (
  id bigint generated always as identity primary key,
  reference text not null unique,
  customer_name text,
  customer_phone text,
  customer_address text,
  payment_method text,
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  status text not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.contacts (
  id bigint generated always as identity primary key,
  reference text not null unique,
  name text not null,
  phone text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.catering_requests (
  id bigint generated always as identity primary key,
  reference text not null unique,
  name text not null,
  phone text not null,
  event_date date,
  guest_count text,
  event_type text,
  details text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.delivery_zones (
  id bigint generated always as identity primary key,
  zone_key text not null unique,
  label text not null,
  fee integer not null default 0,
  eta text not null,
  sort_order integer not null default 0
);

create table if not exists public.menu_items (
  id bigint generated always as identity primary key,
  item_id integer not null unique,
  name text not null,
  category text not null,
  price integer not null default 0,
  rating numeric not null default 0,
  reviews integer not null default 0,
  spicy boolean not null default false,
  badge text,
  description text,
  dietary_tags jsonb not null default '[]'::jsonb,
  dietary_profile text,
  sold_out boolean not null default false,
  hidden boolean not null default false
);
