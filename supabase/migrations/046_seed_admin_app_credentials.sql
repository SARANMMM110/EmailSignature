-- Default admin row for /admin login (bcrypt for password: AdminDemo!2026).
-- Safe if 045 already ran without a row, or for fresh installs.

insert into public.admin_app_credentials (id, username, password_hash, updated_at)
values (
  1,
  'admin',
  '$2b$10$mrfkVO7AkS3PGsCdE0dTeOpTM8rrQFa4nUO9FZL.qEnFbF.RUv7NS',
  now()
)
on conflict (id) do nothing;

grant select, insert, update, delete on table public.admin_app_credentials to service_role;

notify pgrst, 'reload schema';
