-- Layout 11 (lime hello + dark contact stack + round photo) — catalog row for engine `template_11`.
-- UUID matches client + server `templateIds.js`.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000011-0000-4000-8000-000000000011',
    'Layout 11',
    '<!-- engine -->',
    'free',
    'design',
    true,
    true,
    11,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  style = excluded.style,
  has_logo = excluded.has_logo,
  has_photo = excluded.has_photo,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
