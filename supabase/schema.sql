-- =============================================================
-- Trade Partner HQ — Supabase Database Schema
-- Run this in your Supabase SQL Editor (supabase.com dashboard)
-- =============================================================

-- Enable PostGIS for radius/geo queries
create extension if not exists postgis;

-- ─── EVENTS TABLE ────────────────────────────────────────────
create table if not exists events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  date          date not null,
  end_date      date,
  time_info     text,
  event_type    text not null check (event_type in ('networking','bid','certification','conference')),
  source_type   text not null check (source_type in ('sbe_dbe','linkedin_company','linkedin_personal','trade_association','government')),
  source_url    text,
  source_name   text,
  organization  text,
  city          text,
  state         text,
  state_code    text,
  lat           double precision,
  lng           double precision,
  location      geography(Point, 4326),  -- PostGIS point for radius queries
  is_virtual    boolean default false,
  address       text,
  contact_email text,
  contact_phone text,
  tags          text[] default '{}',
  scraped_at    timestamptz default now(),
  created_at    timestamptz default now(),
  -- Dedup: same title + date + org = same event
  constraint events_dedup unique (title, date, organization)
);

-- Auto-populate the PostGIS geography column from lat/lng
create or replace function update_location()
returns trigger as $$
begin
  if NEW.lat is not null and NEW.lng is not null then
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_update_location
  before insert or update on events
  for each row execute function update_location();

-- Indexes for fast filtering
create index if not exists idx_events_date on events (date);
create index if not exists idx_events_state on events (state_code);
create index if not exists idx_events_type on events (event_type);
create index if not exists idx_events_source on events (source_type);
create index if not exists idx_events_location on events using gist (location);
create index if not exists idx_events_search on events using gin (
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(organization,''))
);

-- ─── SAVED EVENTS (bookmarks) ────────────────────────────────
create table if not exists saved_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  event_id   uuid references events(id) on delete cascade,
  created_at timestamptz default now(),
  constraint saved_events_unique unique (user_id, event_id)
);

-- ─── SAVED FILTERS (search alerts) ──────────────────────────
create table if not exists saved_filters (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  filters     jsonb not null default '{}',
  has_alert   boolean default false,
  created_at  timestamptz default now()
);

-- ─── USER PROFILES ───────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  company_name text,
  created_at   timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (NEW.id, NEW.email);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table events enable row level security;
alter table saved_events enable row level security;
alter table saved_filters enable row level security;
alter table profiles enable row level security;

-- Events: anyone can read
create policy "Events are public" on events for select using (true);
-- Events: only service role can insert/update (scrapers use service key)
create policy "Service can manage events" on events for all using (true) with check (true);

-- Saved events: users manage their own
create policy "Users manage own saved events" on saved_events
  for all using (auth.uid() = user_id);

-- Saved filters: users manage their own
create policy "Users manage own saved filters" on saved_filters
  for all using (auth.uid() = user_id);

-- Profiles: users read their own
create policy "Users read own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on profiles
  for update using (auth.uid() = id);

-- ─── HELPER: radius search function ─────────────────────────
create or replace function events_within_radius(
  center_lat double precision,
  center_lng double precision,
  radius_miles double precision
)
returns setof events as $$
  select *
  from events
  where ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
    radius_miles * 1609.34  -- miles to meters
  )
  order by date asc;
$$ language sql stable;
