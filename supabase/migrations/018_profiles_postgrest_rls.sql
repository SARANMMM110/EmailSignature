-- Run this file in the Supabase SQL Editor (or `supabase db push`). Do not run with `node` — it is SQL, not JavaScript.
-- Fixes REST PATCH /profiles 400s: missing account columns, stale PostgREST schema cache, or RLS UPDATE edge cases.

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists job_title text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists logo_url text;

-- PostgREST must reload schema cache after new columns (avoids PGRST204 "column not in schema cache").
notify pgrst, 'reload schema';

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
