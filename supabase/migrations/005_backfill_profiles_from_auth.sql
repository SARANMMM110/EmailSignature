-- Fix missing profiles for existing auth users (prevents signatures_user_id_fkey failures).
-- Run via Supabase SQL editor or `supabase db push` if you use CLI migrations.

insert into public.profiles (id, full_name, avatar_url)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'display_name'
  ),
  nullif(trim(u.raw_user_meta_data->>'avatar_url'), '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;
