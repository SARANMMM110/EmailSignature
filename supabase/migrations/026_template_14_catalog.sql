-- Layout 14 — 600px light card + orange squircle + white footer (engine `template_14`). UUID must match client + server `templateIds.js`.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000014-0000-4000-8000-000000000014',
    'Layout 14',
    '<!-- engine template_14 -->',
    'free',
    'design',
    false,
    true,
    14,
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
