-- Tracks end-user accounts created from Admin → Agencies → "Add user" (Silver / `advanced` plan).
-- Used for listing, disable (auth ban), and remove (delete auth user) from the admin panel.

CREATE TABLE IF NOT EXISTS public.admin_provisioned_app_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  is_disabled BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_provisioned_app_users_created
  ON public.admin_provisioned_app_users (created_at DESC);

ALTER TABLE public.admin_provisioned_app_users ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.admin_provisioned_app_users IS
  'App (Supabase Auth) users provisioned from admin Agencies page; Node uses service_role only.';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_provisioned_app_users TO service_role;
