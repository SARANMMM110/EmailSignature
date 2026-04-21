-- “Explore your world” travel CTA strip — engine `banner_7` (stable UUID).

insert into public.banners (id, name, html_structure, tier, is_active)
values (
  'b0000008-0000-4000-8000-000000000008',
  'Explore your world',
  '<!-- engine -->',
  'pro',
  true
)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
