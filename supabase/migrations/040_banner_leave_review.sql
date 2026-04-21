-- Leave a review CTA card — engine `banner_11` (stable UUID).

insert into public.banners (id, name, html_structure, tier, is_active)
values (
  'b0000012-0000-4000-8000-000000000012',
  'Leave a review',
  '<!-- engine -->',
  'pro',
  true
)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
