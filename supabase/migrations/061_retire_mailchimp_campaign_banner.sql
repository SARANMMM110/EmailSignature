-- Retire desert / “Campaign strip” banner (UUID b0000007). HTML engine maps this id to `banner_4` (Need a call).
update public.banners
set is_active = false
where id = 'b0000007-0000-4000-8000-000000000007';
