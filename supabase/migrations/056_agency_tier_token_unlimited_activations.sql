-- Allow unlimited owner-link activations: NULL max_link_uses means no cap.

ALTER TABLE public.agency_tier_tokens
  DROP CONSTRAINT IF EXISTS agency_tier_tokens_max_link_uses_check;

ALTER TABLE public.agency_tier_tokens
  ALTER COLUMN max_link_uses DROP NOT NULL;

ALTER TABLE public.agency_tier_tokens
  ALTER COLUMN max_link_uses SET DEFAULT NULL;

ALTER TABLE public.agency_tier_tokens
  ADD CONSTRAINT agency_tier_tokens_max_link_uses_check
  CHECK (max_link_uses IS NULL OR (max_link_uses >= 1 AND max_link_uses <= 5000));

COMMENT ON COLUMN public.agency_tier_tokens.max_link_uses IS
  'How many separate agencies may activate from this token; NULL = unlimited.';

NOTIFY pgrst, 'reload schema';
