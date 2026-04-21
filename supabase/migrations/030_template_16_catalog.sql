-- Layout 16 — 600px navy split + seam portrait (engine `template_16`). UUID must match client + server `templateIds.js`.
-- Applied after `029_remove_template_16.sql` when reintroducing the catalog row.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  (
    'a0000016-0000-4000-8000-000000000016',
    'Layout 16',
    '<!-- engine template_16 -->',
    'free',
    'design',
    true,
    true,
    16,
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
