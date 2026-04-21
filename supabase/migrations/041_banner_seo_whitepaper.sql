-- Dark grid SEO / resource strip — engine `banner_12` (stable UUID).

insert into public.banners (id, name, html_structure, tier, is_active)
values (
  'b0000013-0000-4000-8000-000000000013',
  'SEO whitepaper',
  '<!-- engine -->',
  'pro',
  true
)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
