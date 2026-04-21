-- App admin panel login (separate from Supabase end-user auth). Single row, server-managed only.

create table if not exists public.admin_app_credentials (
  id int primary key check (id = 1),
  username text not null,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_app_credentials enable row level security;

-- No policies: only the API (service role) reads/writes this table.

notify pgrst, 'reload schema';
