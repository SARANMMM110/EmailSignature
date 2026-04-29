-- Retire Mindscope ATS CTA strip (UUID b0000006). Engine maps this id to `banner_2` (Book a call).
-- Reassign signatures so FK stays valid; clear stacked slot if it pointed at the same banner.

update public.signatures
set banner_id = 'b0000001-0000-4000-8000-000000000001'
where banner_id = 'b0000006-0000-4000-8000-000000000006';

update public.signatures
set banner_config =
  jsonb_set(
    jsonb_set(
      banner_config,
      '{secondary_banner_id}',
      to_jsonb('b0000001-0000-4000-8000-000000000001'::text),
      true
    ),
    '{secondary_preset_id}',
    to_jsonb('book-call'::text),
    true
  )
where lower(trim(banner_config->>'secondary_banner_id')) = 'b0000006-0000-4000-8000-000000000006';

update public.banners
set is_active = false
where id = 'b0000006-0000-4000-8000-000000000006';
