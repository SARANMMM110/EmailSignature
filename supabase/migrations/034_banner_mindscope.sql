-- Mindscope-style ATS CTA strip — engine `banner_5` (table layout, stable UUID).

insert into public.banners (id, name, html_structure, tier, is_active)
values (
  'b0000006-0000-4000-8000-000000000006',
  'Mindscope ATS',
  '<!-- engine -->',
  'pro',
  true
)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
