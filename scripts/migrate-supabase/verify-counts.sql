-- Run on OLD project, then on NEW project — counts should match after migration.

SELECT 'auth.users' AS tbl, count(*) AS rows FROM auth.users
UNION ALL SELECT 'public.profiles', count(*) FROM public.profiles
UNION ALL SELECT 'public.signatures', count(*) FROM public.signatures
UNION ALL SELECT 'public.templates', count(*) FROM public.templates
UNION ALL SELECT 'public.banners', count(*) FROM public.banners
UNION ALL SELECT 'public.user_palettes', count(*) FROM public.user_palettes
UNION ALL SELECT 'public.signature_clicks', count(*) FROM public.signature_clicks
UNION ALL SELECT 'public.teams', count(*) FROM public.teams
UNION ALL SELECT 'public.agencies', count(*) FROM public.agencies
UNION ALL SELECT 'public.agency_members', count(*) FROM public.agency_members
UNION ALL SELECT 'public.agency_registration_links', count(*) FROM public.agency_registration_links
UNION ALL SELECT 'public.agency_tier_tokens', count(*) FROM public.agency_tier_tokens
UNION ALL SELECT 'public.registration_links', count(*) FROM public.registration_links
UNION ALL SELECT 'public.registration_redemptions', count(*) FROM public.registration_redemptions
UNION ALL SELECT 'public.admin_app_credentials', count(*) FROM public.admin_app_credentials
UNION ALL SELECT 'public.admin_panel_users', count(*) FROM public.admin_panel_users
UNION ALL SELECT 'public.admin_provisioned_app_users', count(*) FROM public.admin_provisioned_app_users
UNION ALL SELECT 'storage.objects', count(*) FROM storage.objects
ORDER BY tbl;
