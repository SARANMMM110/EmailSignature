-- Layout 22 — 620×200 cream editorial card (engine `template_22`). UUID must match client + server `templateIds.js`.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000022-0000-4000-8000-000000000022',
    'Layout 22',
    '<!-- engine template_22 -->',
    'free',
    'design',
    true,
    true,
    22,
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
