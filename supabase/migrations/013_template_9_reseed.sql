-- Layout 9 (Montserrat / brand rule card) — re-seed after 012_remove_template_9; UUID matches templateIds.js

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  ('a0000009-0000-4000-8000-000000000009', 'Layout 9', '<!-- engine -->', 'free', 'design', true, false, 9, true)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  style = excluded.style,
  has_logo = excluded.has_logo,
  has_photo = excluded.has_photo,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
