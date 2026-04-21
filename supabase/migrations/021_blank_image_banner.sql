-- Image-only CTA strip (full-width photo, optional link) — engine `banner_blank`.

insert into public.banners (id, name, html_structure, tier, is_active)
values (
  'b0000005-0000-4000-8000-000000000005',
  'Image only',
  '<!-- engine -->',
  'free',
  true
)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  is_active = excluded.is_active;
