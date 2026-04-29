-- Subscriber journey CTA (lavender illustrated rail + navy copy + gradient CTA) — engine `banner_4`.
insert into public.banners (id, name, html_structure, tier, is_active)
values (
  'b0000015-0000-4000-8000-000000000015',
  'Subscriber journey',
  '<!-- engine -->',
  'free',
  true
)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
