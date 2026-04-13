-- Extended account fields for "My informations" (first/last name, job, contact, logo).
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists job_title text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists logo_url text;
