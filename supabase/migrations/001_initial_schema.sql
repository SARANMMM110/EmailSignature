-- =============================================
-- EMAIL SIGNATURE BUILDER — SUPABASE SCHEMA
-- =============================================
-- Run once in Supabase SQL Editor (new project) or via `supabase db push`.

-- gen_random_uuid() is available on Supabase (PostgreSQL 13+).

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'pro', 'business')),
  team_id uuid,
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- TEAMS TABLE
-- =============================================
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  admin_id uuid references public.profiles (id) on delete cascade,
  plan text default 'business',
  created_at timestamptz default now()
);

alter table public.profiles
  add constraint fk_team foreign key (team_id) references public.teams (id) on delete set null;

-- =============================================
-- SYSTEM COLOR PALETTES
-- =============================================
create table public.system_palettes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  colors jsonb not null, -- array of 4 hex strings: ["#000000", "#333333", "#e0e0e0", "#ffffff"]
  sort_order integer default 0,
  is_active boolean default true
);

-- =============================================
-- USER CUSTOM PALETTES
-- =============================================
create table public.user_palettes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles (id) on delete cascade not null,
  name text not null,
  colors jsonb not null,
  created_at timestamptz default now()
);

-- =============================================
-- SIGNATURE TEMPLATES (system-wide, managed by admin)
-- =============================================
create table public.templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  html_structure text not null, -- HTML with {{token}} placeholders
  preview_img_url text,
  tier text default 'free' check (tier in ('free', 'pro')),
  style text check (style in ('design', 'minimalist')),
  has_logo boolean default true,
  has_photo boolean default true,
  color_count integer default 6,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- CTA BANNERS (system-wide)
-- =============================================
create table public.banners (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  html_structure text not null,
  preview_img_url text,
  tier text default 'free' check (tier in ('free', 'pro', 'business')),
  color_count integer default 6,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- USER SIGNATURES
-- =============================================
create table public.signatures (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles (id) on delete cascade not null,
  template_id uuid references public.templates (id),
  banner_id uuid references public.banners (id),
  label text default 'My signature',
  signature_link text,
  show_badge boolean default true,
  fields jsonb default '{}'::jsonb,
  -- fields shape: { full_name, job_title, company, phone, email, website, address, pronouns, photo_url, logo_url }
  design jsonb default '{}'::jsonb,
  -- design shape: { palette_id, palette_type, colors: [], font, photo_shape }
  social_links jsonb default '{}'::jsonb,
  -- social shape: { linkedin, twitter, instagram, facebook, youtube, github, tiktok, calendly }
  banner_config jsonb default '{}'::jsonb,
  -- banner shape: { link_url }
  generated_html text,
  version integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- ANALYTICS (Business plan)
-- =============================================
create table public.signature_clicks (
  id uuid default gen_random_uuid() primary key,
  signature_id uuid references public.signatures (id) on delete cascade,
  clicked_at timestamptz default now(),
  user_agent text,
  country_code text,
  ip_hash text
);

create index if not exists signatures_user_id_idx on public.signatures (user_id);
create index if not exists signatures_template_id_idx on public.signatures (template_id);
create index if not exists signature_clicks_signature_id_idx on public.signature_clicks (signature_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table public.profiles enable row level security;
alter table public.signatures enable row level security;
alter table public.user_palettes enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can view own signatures"
  on public.signatures for select
  using (auth.uid() = user_id);

create policy "Users can insert own signatures"
  on public.signatures for insert
  with check (auth.uid() = user_id);

create policy "Users can update own signatures"
  on public.signatures for update
  using (auth.uid() = user_id);

create policy "Users can delete own signatures"
  on public.signatures for delete
  using (auth.uid() = user_id);

create policy "Users can manage own palettes"
  on public.user_palettes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Templates and system palettes: public read
alter table public.templates enable row level security;
alter table public.system_palettes enable row level security;
alter table public.banners enable row level security;

create policy "Templates are publicly readable"
  on public.templates for select
  using (true);

create policy "System palettes are publicly readable"
  on public.system_palettes for select
  using (true);

create policy "Banners are publicly readable"
  on public.banners for select
  using (true);

-- =============================================
-- AUTO-UPDATE updated_at TRIGGER
-- =============================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_signatures_updated_at on public.signatures;
create trigger update_signatures_updated_at
  before update on public.signatures
  for each row
  execute function public.update_updated_at_column();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =============================================
-- SEED DATA — SYSTEM PALETTES
-- =============================================

insert into public.system_palettes (name, colors, sort_order) values
  ('Black & white', '["#000000", "#1a1a1a", "#e0e0e0", "#ffffff"]'::jsonb, 1),
  ('Ocean Blue', '["#1e3a5f", "#2d6a9f", "#a8d4f5", "#f0f8ff"]'::jsonb, 2),
  ('Uber Eats', '["#06c167", "#000000", "#1a1a1a", "#f4f4f4"]'::jsonb, 3),
  ('Airbnb', '["#ff385c", "#8b0000", "#f7f7f7", "#333333"]'::jsonb, 4),
  ('Webflow', '["#4353ff", "#1a1f71", "#e8eaff", "#f5f5f5"]'::jsonb, 5),
  ('Forest', '["#2d6a4f", "#1b4332", "#d8f3dc", "#f8f9fa"]'::jsonb, 6),
  ('Sunset', '["#e63946", "#f4a261", "#fff3e0", "#1d3557"]'::jsonb, 7),
  ('Slate', '["#334155", "#0f172a", "#e2e8f0", "#f8fafc"]'::jsonb, 8),
  ('Purple Pro', '["#7c3aed", "#4c1d95", "#ede9fe", "#faf5ff"]'::jsonb, 9),
  ('Gold', '["#b45309", "#78350f", "#fef3c7", "#fffbeb"]'::jsonb, 10);

-- =============================================
-- SUPABASE STORAGE — signature-images bucket
-- =============================================
-- Optional: create in Dashboard (Storage → New bucket) if this insert is restricted.

insert into storage.buckets (id, name, public)
values ('signature-images', 'signature-images', true)
on conflict (id) do nothing;

drop policy if exists "signature_images_public_read" on storage.objects;
create policy "signature_images_public_read"
  on storage.objects for select
  using (bucket_id = 'signature-images');

drop policy if exists "signature_images_upload_own" on storage.objects;
create policy "signature_images_upload_own"
  on storage.objects for insert
  with check (
    bucket_id = 'signature-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "signature_images_update_own" on storage.objects;
create policy "signature_images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'signature-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "signature_images_delete_own" on storage.objects;
create policy "signature_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'signature-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
