-- Wellness “Boost and Improve” CTA strip — engine `banner_8` (stable UUID).

insert into public.banners (id, name, html_structure, tier, is_active)
values (
  'b0000009-0000-4000-8000-000000000009',
  'Boost & improve',
  '<!-- engine -->',
  'pro',
  true
)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
