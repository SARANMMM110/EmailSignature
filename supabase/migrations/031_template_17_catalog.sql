-- Layout 17 — 600px creative card + lime bar (engine `template_17`). UUID must match client + server `templateIds.js`.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000017-0000-4000-8000-000000000017',
    'Layout 17',
    '<!-- engine template_17 -->',
    'free',
    'design',
    false,
    true,
    17,
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
