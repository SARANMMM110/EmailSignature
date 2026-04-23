-- Multi-user admin panel + tier token metadata (creator name, preset agency name, multi-use owner link).

-- ═══════════════════════════════════════════════════════════
-- Admin panel users (separate from Supabase end-user auth)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.admin_panel_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_panel_users ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.admin_panel_users IS 'Internal admin console logins; API uses service_role only.';

-- Default logins (change in production): admin/AdminDemo!2026, saran/Saran123, just/Just123, vineet/Vineet123, frank/Frank123
INSERT INTO public.admin_panel_users (username, display_name, password_hash)
VALUES
  (
    'admin',
    'Administrator',
    '$2b$10$U0uq4gDnwWFC/TbZ9oDwR.G113ZS3R2v499zv3WsVT5yRXR4QVz4C'
  ),
  (
    'saran',
    'Saran',
    '$2b$10$U/XCLYV9cY.SXS1dlqzcj.SSZHGzxtk1KP4tB9PpH.nS1uwZZuKtW'
  ),
  (
    'just',
    'Just',
    '$2b$10$BgH0gumj1OOk35O800EUH.wAfTYJzjwFUI.QVbuRHRw/kn9BBicxG'
  ),
  (
    'vineet',
    'Vineet',
    '$2b$10$HfgLl8AHwQhAmNW4DjcuHe3/hzSKnK3uO/r3blw9r6upt4KFfs7ZG'
  ),
  (
    'frank',
    'Frank',
    '$2b$10$nx8cMR90cuoHlOH2p9cLK.chgctltJctgOpzCAEQ1mkpYpOCi.4SW'
  )
ON CONFLICT (username) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Tier tokens: who created the link, optional org name, N activations
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.agency_tier_tokens
  ADD COLUMN IF NOT EXISTS created_by_admin_name TEXT,
  ADD COLUMN IF NOT EXISTS preset_agency_name TEXT,
  ADD COLUMN IF NOT EXISTS max_link_uses INTEGER;

UPDATE public.agency_tier_tokens
SET max_link_uses = 1
WHERE max_link_uses IS NULL;

ALTER TABLE public.agency_tier_tokens
  ALTER COLUMN max_link_uses SET NOT NULL,
  ALTER COLUMN max_link_uses SET DEFAULT 1;

ALTER TABLE public.agency_tier_tokens
  DROP CONSTRAINT IF EXISTS agency_tier_tokens_max_link_uses_check;

ALTER TABLE public.agency_tier_tokens
  ADD CONSTRAINT agency_tier_tokens_max_link_uses_check CHECK (max_link_uses >= 1 AND max_link_uses <= 5000);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_panel_users TO service_role;

NOTIFY pgrst, 'reload schema';
