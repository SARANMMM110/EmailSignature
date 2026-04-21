-- Green gradient CTA strip — engine `banner_13` (stable UUID).

insert into public.banners (id, name, html_structure, tier, is_active)
values (
  'b0000014-0000-4000-8000-000000000014',
  'Green gradient CTA',
  '<!-- engine -->',
  'pro',
  true
)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
