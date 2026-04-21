-- Online loan / Revolio-style CTA strip — engine `banner_9` (stable UUID).

insert into public.banners (id, name, html_structure, tier, is_active)
values (
  'b0000010-0000-4000-8000-000000000010',
  'Online loan',
  '<!-- engine -->',
  'pro',
  true
)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
