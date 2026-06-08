-- Run in NEW Supabase project → SQL Editor (after DB restore + storage file copy).
-- Replaces old project host in URL columns.

-- OLD: sjczvtjrvmzhtkfhtag  →  NEW: xcydigxeazgxndgxmohk

UPDATE public.profiles
SET
  avatar_url = replace(avatar_url, 'https://sjczvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co'),
  logo_url = replace(logo_url, 'https://sjczvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')
WHERE avatar_url LIKE '%sjczvtjrvmzhtkfhtag%'
   OR logo_url LIKE '%sjczvtjrvmzhtkfhtag%';

UPDATE public.signatures
SET
  generated_html = replace(generated_html, 'https://sjczvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co'),
  fields = replace(fields::text, 'https://sjczvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')::jsonb,
  banner_config = replace(banner_config::text, 'https://sjczvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')::jsonb,
  design = replace(design::text, 'https://sjczvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')::jsonb
WHERE generated_html LIKE '%sjczvtjrvmzhtkfhtag%'
   OR fields::text LIKE '%sjczvtjrvmzhtkfhtag%'
   OR banner_config::text LIKE '%sjczvtjrvmzhtkfhtag%'
   OR design::text LIKE '%sjczvtjrvmzhtkfhtag%';

UPDATE public.templates
SET
  preview_img_url = replace(preview_img_url, 'https://sjczvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co'),
  html_structure = replace(html_structure, 'https://sjczvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')
WHERE preview_img_url LIKE '%sjczvtjrvmzhtkfhtag%'
   OR html_structure LIKE '%sjczvtjrvmzhtkfhtag%';

UPDATE public.banners
SET html_structure = replace(html_structure, 'https://sjczvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')
WHERE html_structure LIKE '%sjczvtjrvmzhtkfhtag%';

-- Should return 0 rows when migration is complete:
SELECT count(*) AS profiles_still_old FROM public.profiles WHERE avatar_url LIKE '%sjczvtjrvmzhtkfhtag%' OR logo_url LIKE '%sjczvtjrvmzhtkfhtag%';
SELECT count(*) AS signatures_still_old FROM public.signatures WHERE generated_html LIKE '%sjczvtjrvmzhtkfhtag%';
