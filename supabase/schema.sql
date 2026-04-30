create table if not exists public.orders (
  id bigint generated always as identity primary key,
  reference text not null unique,
  customer_name text,
  customer_phone text,
  customer_address text,
  payment_method text,
  branch_id text,
  branch_name text,
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  payment jsonb not null default '{}'::jsonb,
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
  branch_id text,
  branch_name text,
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
  branch_id text,
  branch_name text,
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
  image_url text,
  stock_quantity integer not null default 0,
  dietary_tags jsonb not null default '[]'::jsonb,
  dietary_profile text,
  sold_out boolean not null default false,
  hidden boolean not null default false
);

alter table public.menu_items
add column if not exists image_url text;

alter table public.menu_items
add column if not exists stock_quantity integer not null default 0;

alter table public.menu_items
add column if not exists available_from text;

alter table public.menu_items
add column if not exists available_until text;

alter table public.menu_items
add column if not exists available_days jsonb not null default '[]'::jsonb;

alter table public.orders
add column if not exists branch_id text;

alter table public.orders
add column if not exists branch_name text;

alter table public.contacts
add column if not exists branch_id text;

alter table public.contacts
add column if not exists branch_name text;

alter table public.catering_requests
add column if not exists branch_id text;

alter table public.catering_requests
add column if not exists branch_name text;

create table if not exists public.business_settings (
  id bigint generated always as identity primary key,
  singleton text not null unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id bigint generated always as identity primary key,
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  phone text,
  favorite_item_ids jsonb not null default '[]'::jsonb,
  saved_addresses jsonb not null default '[]'::jsonb,
  order_references jsonb not null default '[]'::jsonb,
  notifications jsonb not null default '[]'::jsonb,
  loyalty_points integer not null default 0,
  loyalty_tier text not null default 'bronze',
  referral_code text,
  referred_by text,
  referral_credits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.users
add column if not exists referral_code text;

alter table public.users
add column if not exists referred_by text;

alter table public.users
add column if not exists referral_credits integer not null default 0;

create table if not exists public.reservations (
  id bigint generated always as identity primary key,
  reference text not null unique,
  name text not null,
  phone text not null,
  date text not null,
  time text not null,
  guests text not null,
  notes text,
  branch_id text,
  branch_name text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  reference text not null unique,
  order_reference text not null,
  customer_name text not null,
  branch_id text,
  branch_name text,
  rating integer not null,
  comment text,
  created_at timestamptz not null default now()
);

alter table public.reservations
add column if not exists branch_id text;

alter table public.reservations
add column if not exists branch_name text;

alter table public.reviews
add column if not exists branch_id text;

alter table public.reviews
add column if not exists branch_name text;

create table if not exists public.gifts (
  id bigint generated always as identity primary key,
  reference text not null unique,
  sender_email text not null,
  sender_name text not null,
  sender_phone text,
  recipient_email text not null,
  recipient_name text,
  branch_id text,
  branch_name text,
  branch_address text,
  branch_phone text,
  delivery_zone text,
  delivery_eta text,
  gift_message text,
  recipient_address text,
  recipient_landmark text,
  recipient_phone text,
  items jsonb not null default '[]'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  payment jsonb not null default '{}'::jsonb,
  status text not null default 'pending_acceptance',
  order_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  responded_at timestamptz
);

create table if not exists public.sessions (
  token_hash text primary key,
  scope text not null,
  email text,
  username text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_expires_at_idx on public.sessions (expires_at);
create index if not exists sessions_email_idx on public.sessions (email);

create table if not exists public.email_verifications (
  token_hash text primary key,
  email text not null,
  purpose text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create index if not exists email_verifications_email_idx on public.email_verifications (email);
create index if not exists email_verifications_expires_at_idx on public.email_verifications (expires_at);

alter table public.users
add column if not exists email_verified boolean not null default false;

alter table public.users
add column if not exists email_verified_at timestamptz;

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_type text not null,
  actor_id text,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_type, actor_id);

create table if not exists public.admin_credentials (
  username text primary key,
  totp_secret text,
  totp_enabled boolean not null default false,
  recovery_code_hashes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

notify pgrst, 'reload schema';
