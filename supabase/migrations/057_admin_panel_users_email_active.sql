-- Console user roster: optional email + enable/disable without deleting rows.

ALTER TABLE public.admin_panel_users
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS admin_panel_users_email_unique
  ON public.admin_panel_users (email)
  WHERE email IS NOT NULL AND btrim(email) <> '';

COMMENT ON COLUMN public.admin_panel_users.email IS 'Contact / roster email (login is still by username).';
COMMENT ON COLUMN public.admin_panel_users.is_active IS 'When false, this user cannot sign in to the admin console.';

NOTIFY pgrst, 'reload schema';
