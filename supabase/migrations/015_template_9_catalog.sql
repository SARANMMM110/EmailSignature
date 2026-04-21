-- Layout 9 (hero / full-bleed palette background) — catalog row for engine `template_9`.
-- UUID matches client + server `templateIds.js`.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000009-0000-4000-8000-000000000009',
    'Layout 9',
    '<!-- engine -->',
    'free',
    'design',
    true,
    true,
    9,
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
