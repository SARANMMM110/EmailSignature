-- Layout 13 — 600×172 dark card + yellow photo rail (engine `template_13`). UUID must match client + server `templateIds.js`.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000013-0000-4000-8000-000000000013',
    'Layout 13',
    '<!-- engine template_13 -->',
    'free',
    'design',
    false,
    true,
    13,
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
