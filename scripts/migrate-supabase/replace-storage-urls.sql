-- Run in NEW Supabase project → SQL Editor (after DB restore + storage file copy).
-- Replaces old project host in URL columns.

-- OLD: sjcjzvtjrvmzhtkfhtag  →  NEW: xcydigxeazgxndgxmohk

UPDATE public.profiles
SET
  avatar_url = replace(avatar_url, 'https://sjcjzvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co'),
  logo_url = replace(logo_url, 'https://sjcjzvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')
WHERE avatar_url LIKE '%sjcjzvtjrvmzhtkfhtag%'
   OR logo_url LIKE '%sjcjzvtjrvmzhtkfhtag%';

UPDATE public.signatures
SET
  generated_html = replace(generated_html, 'https://sjcjzvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co'),
  fields = replace(fields::text, 'https://sjcjzvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')::jsonb,
  banner_config = replace(banner_config::text, 'https://sjcjzvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')::jsonb,
  design = replace(design::text, 'https://sjcjzvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')::jsonb
WHERE generated_html LIKE '%sjcjzvtjrvmzhtkfhtag%'
   OR fields::text LIKE '%sjcjzvtjrvmzhtkfhtag%'
   OR banner_config::text LIKE '%sjcjzvtjrvmzhtkfhtag%'
   OR design::text LIKE '%sjcjzvtjrvmzhtkfhtag%';

UPDATE public.templates
SET
  preview_img_url = replace(preview_img_url, 'https://sjcjzvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co'),
  html_structure = replace(html_structure, 'https://sjcjzvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')
WHERE preview_img_url LIKE '%sjcjzvtjrvmzhtkfhtag%'
   OR html_structure LIKE '%sjcjzvtjrvmzhtkfhtag%';

UPDATE public.banners
SET html_structure = replace(html_structure, 'https://sjcjzvtjrvmzhtkfhtag.supabase.co', 'https://xcydigxeazgxndgxmohk.supabase.co')
WHERE html_structure LIKE '%sjcjzvtjrvmzhtkfhtag%';

-- Should return 0 when migration is complete:
SELECT count(*) AS profiles_still_old FROM public.profiles WHERE avatar_url LIKE '%sjcjzvtjrvmzhtkfhtag%' OR logo_url LIKE '%sjcjzvtjrvmzhtkfhtag%';
SELECT count(*) AS signatures_still_old FROM public.signatures WHERE generated_html LIKE '%sjcjzvtjrvmzhtkfhtag%';
