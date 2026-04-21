-- Re-enable Layout 12 (chartreuse hero + SNS column) after migration 020 removed it.
-- Engine slug `template_12` — UUID must match client + server `templateIds.js`.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000012-0000-4000-8000-000000000012',
    'Layout 12',
    '<!-- engine template_12 -->',
    'free',
    'design',
    false,
    true,
    12,
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
