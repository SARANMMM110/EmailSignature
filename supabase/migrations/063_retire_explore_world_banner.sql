-- Retire “Explore your world” CTA strip (UUID b0000008). HTML engine maps this id to `banner_2` (Book a call).
update public.banners
set is_active = false
where id = 'b0000008-0000-4000-8000-000000000008';
