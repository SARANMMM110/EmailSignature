-- Seed templates & banners (stable UUIDs for API FKs). Safe to re-run with ON CONFLICT.

insert into public.templates (id, name, html_structure, tier, style, has_logo, has_photo, sort_order, is_active)
values
  ('a0000001-0000-4000-8000-000000000001', 'Classic Split', '<!-- engine -->', 'free', 'design', true, true, 1, true),
  ('a0000002-0000-4000-8000-000000000002', 'Bold Header', '<!-- engine -->', 'free', 'design', true, true, 2, true),
  ('a0000003-0000-4000-8000-000000000003', 'Minimal Left', '<!-- engine -->', 'free', 'minimalist', false, false, 3, true),
  ('a0000004-0000-4000-8000-000000000004', 'Card Style', '<!-- engine -->', 'free', 'design', true, true, 4, true),
  ('a0000005-0000-4000-8000-000000000005', 'Executive', '<!-- engine -->', 'pro', 'design', true, true, 5, true),
  ('a0000006-0000-4000-8000-000000000006', 'Layout 6', '<!-- engine -->', 'pro', 'design', true, true, 6, true)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  style = excluded.style,
  has_logo = excluded.has_logo,
  has_photo = excluded.has_photo,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.banners (id, name, html_structure, tier, is_active)
values
  ('b0000001-0000-4000-8000-000000000001', 'Book a call', '<!-- engine -->', 'free', true),
  ('b0000002-0000-4000-8000-000000000002', 'Download', '<!-- engine -->', 'free', true),
  ('b0000003-0000-4000-8000-000000000003', 'Webinar', '<!-- engine -->', 'pro', true)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
