-- Layout 9 (compact card + photo + logo corner) — stable UUID matches server/client templateIds.js

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  ('a0000009-0000-4000-8000-000000000009', 'Layout 9', '<!-- engine -->', 'free', 'minimalist', true, true, 9, true)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  style = excluded.style,
  has_logo = excluded.has_logo,
  has_photo = excluded.has_photo,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
