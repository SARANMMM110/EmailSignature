-- ═══════════════════════════════════════════════════════════════════════════
-- Agency (Tier 2) system — separate from Tier 1 plans (personal/advanced/ultimate).
-- Original spec filename: 003_agency_system.sql; numbered 048+ to follow repo order.
-- Apply: `supabase db push` or paste into Supabase SQL editor (after existing migrations).
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════
-- TABLE 1: agency_tier_tokens
-- Created by ADMIN ONLY to grant agency status to a user
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.agency_tier_tokens (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token            TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  agency_type      TEXT NOT NULL CHECK (agency_type IN ('100', '250', '500')),
  max_seats        INTEGER NOT NULL CHECK (max_seats IN (100, 250, 500)),
  label            TEXT,
  created_by_admin UUID NOT NULL,
  used_by          UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  used_at          TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- TABLE 2: agencies
-- One row per agency account (one per agency owner)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.agencies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  agency_type TEXT NOT NULL CHECK (agency_type IN ('100', '250', '500')),
  max_seats   INTEGER NOT NULL,
  seats_used  INTEGER NOT NULL DEFAULT 0,
  agency_name TEXT,
  token_id    UUID REFERENCES public.agency_tier_tokens (id),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id)
);

-- ═══════════════════════════════════════════════════════
-- TABLE 3: agency_registration_links
-- Created by the AGENCY OWNER to invite team members
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.agency_registration_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES public.agencies (id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  assigned_plan TEXT NOT NULL CHECK (assigned_plan IN ('personal', 'advanced', 'ultimate')),
  label         TEXT,
  max_users     INTEGER NOT NULL DEFAULT 1,
  used_count    INTEGER NOT NULL DEFAULT 0,
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- TABLE 4: agency_members
-- Records who joined via an agency link
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.agency_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES public.agencies (id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  link_id       UUID REFERENCES public.agency_registration_links (id) ON DELETE SET NULL,
  assigned_plan TEXT NOT NULL,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  removed_at    TIMESTAMPTZ,
  removed_by    UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  UNIQUE (agency_id, member_id)
);

-- ═══════════════════════════════════════════════════════
-- PROFILES TABLE: add agency columns
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_agency_owner BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agency_joined_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agency_members_agency ON public.agency_members (agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_member ON public.agency_members (member_id);
CREATE INDEX IF NOT EXISTS idx_agency_reg_links_agency ON public.agency_registration_links (agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_reg_links_token ON public.agency_registration_links (token);
CREATE INDEX IF NOT EXISTS idx_agency_tier_tokens_token ON public.agency_tier_tokens (token);
CREATE INDEX IF NOT EXISTS idx_agencies_owner ON public.agencies (owner_id);

-- ═══════════════════════════════════════════════════════
-- TRIGGER: auto-update seats_used in agencies table
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_agency_seats_used()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.agencies
  SET seats_used = (
    SELECT COUNT(*)::integer
    FROM public.agency_members
    WHERE agency_id = COALESCE(NEW.agency_id, OLD.agency_id)
      AND is_active = true
  )
  WHERE id = COALESCE(NEW.agency_id, OLD.agency_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_agency_seats ON public.agency_members;
CREATE TRIGGER trigger_update_agency_seats
  AFTER INSERT OR UPDATE OR DELETE ON public.agency_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agency_seats_used();

-- ═══════════════════════════════════════════════════════
-- TRIGGER: auto-update used_count on registration links
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_link_used_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.agency_registration_links
  SET used_count = (
    SELECT COUNT(*)::integer
    FROM public.agency_members
    WHERE link_id = COALESCE(NEW.link_id, OLD.link_id)
      AND is_active = true
  )
  WHERE id = COALESCE(NEW.link_id, OLD.link_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_link_count ON public.agency_members;
CREATE TRIGGER trigger_update_link_count
  AFTER INSERT OR UPDATE OR DELETE ON public.agency_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_link_used_count();

-- ═══════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_registration_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_tier_tokens ENABLE ROW LEVEL SECURITY;

-- Agencies: owner can see, create, and update their own agency
CREATE POLICY "Agency owner can view own agency"
  ON public.agencies FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Agency owner can insert own agency"
  ON public.agencies FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Agency owner can update own agency"
  ON public.agencies FOR UPDATE
  USING (owner_id = auth.uid());

-- Registration links: agency owner manages their own links
CREATE POLICY "Agency owner manages own links"
  ON public.agency_registration_links FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    )
  );

-- Members: agency owner can see/manage their members
CREATE POLICY "Agency owner sees own members"
  ON public.agency_members FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM public.agencies WHERE owner_id = auth.uid()
    )
  );

-- Members can see their own membership record
CREATE POLICY "Member sees own record"
  ON public.agency_members FOR SELECT
  USING (member_id = auth.uid());

-- Agency tier tokens: regular users can only READ active rows (prefer validating via service_role RPC in production).
CREATE POLICY "Anyone can read active token by value"
  ON public.agency_tier_tokens FOR SELECT
  USING (is_active = true);

COMMENT ON TABLE public.agency_tier_tokens IS
  'Tier 2 agency seat tokens. SELECT policy is permissive — tighten with SECURITY DEFINER RPC if token values must stay secret.';
