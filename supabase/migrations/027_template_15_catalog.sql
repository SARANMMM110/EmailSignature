-- Layout 15 — 640px lime + white card + black social rail (engine `template_15`). UUID must match client + server `templateIds.js`.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000015-0000-4000-8000-000000000015',
    'Layout 15',
    '<!-- engine template_15 -->',
    'free',
    'design',
    true,
    true,
    15,
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
