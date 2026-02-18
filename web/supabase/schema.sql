-- CalorieCanvas schema (v1)
-- Run this in Supabase SQL editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  telegram_user_id bigint unique,
  created_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  occurred_at timestamptz not null,
  meal_type text not null,
  confidence text,
  notes text,
  source text not null default 'web',
  source_chat_id text,
  source_message_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  name text not null,
  quantity text,
  calories numeric not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  fiber_g numeric not null default 0,
  sugar_g numeric not null default 0
);

create table if not exists public.targets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  calories_target numeric,
  protein_target_g numeric,
  updated_at timestamptz not null default now()
);

create table if not exists public.defaults (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  payload jsonb not null,
  source text,
  updated_at timestamptz not null default now(),
  unique(user_id, key)
);

-- Stores Telegram ingests from users who have not linked their telegram_user_id yet.
create table if not exists public.unlinked_ingest (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint not null,
  telegram_chat_id text,
  telegram_message_id text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Auto-create profile row on sign-up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.targets enable row level security;
alter table public.defaults enable row level security;

-- Profiles: users can read/write self
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Meals: users can CRUD own
create policy "meals_select_own" on public.meals
  for select using (auth.uid() = user_id);
create policy "meals_insert_own" on public.meals
  for insert with check (auth.uid() = user_id);
create policy "meals_update_own" on public.meals
  for update using (auth.uid() = user_id);
create policy "meals_delete_own" on public.meals
  for delete using (auth.uid() = user_id);

-- Meal items: via meal ownership
create policy "meal_items_select_own" on public.meal_items
  for select using (
    exists (select 1 from public.meals m where m.id = meal_items.meal_id and m.user_id = auth.uid())
  );
create policy "meal_items_insert_own" on public.meal_items
  for insert with check (
    exists (select 1 from public.meals m where m.id = meal_items.meal_id and m.user_id = auth.uid())
  );
create policy "meal_items_update_own" on public.meal_items
  for update using (
    exists (select 1 from public.meals m where m.id = meal_items.meal_id and m.user_id = auth.uid())
  );
create policy "meal_items_delete_own" on public.meal_items
  for delete using (
    exists (select 1 from public.meals m where m.id = meal_items.meal_id and m.user_id = auth.uid())
  );

-- Targets/defaults: users own
create policy "targets_rw_own" on public.targets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "defaults_rw_own" on public.defaults
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Unlinked ingest: no RLS (service role only in production). Keep RLS disabled for now.
-- In production, lock this table down and only write via service role key.

-- Helpful view: daily totals in America/Los_Angeles
create or replace view public.daily_totals_pst as
select
  m.user_id,
  (timezone('America/Los_Angeles', m.occurred_at))::date as local_date,
  sum(i.calories) as calories,
  sum(i.protein_g) as protein_g,
  sum(i.carbs_g) as carbs_g,
  sum(i.fat_g) as fat_g,
  sum(i.fiber_g) as fiber_g,
  sum(i.sugar_g) as sugar_g
from public.meals m
join public.meal_items i on i.meal_id = m.id
group by 1,2;
