-- Layout 20 — 600×200 dark neon card (engine `template_20`). UUID must match client + server `templateIds.js`.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000020-0000-4000-8000-000000000020',
    'Layout 20',
    '<!-- engine template_20 -->',
    'free',
    'design',
    false,
    true,
    20,
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
