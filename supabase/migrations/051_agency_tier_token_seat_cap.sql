-- Allow agency tier tokens to set max_seats anywhere from 1 up to the tier ceiling
-- (100 / 250 / 500). Previously max_seats had to equal the tier exactly.

ALTER TABLE public.agency_tier_tokens
  DROP CONSTRAINT IF EXISTS agency_tier_tokens_max_seats_check;

ALTER TABLE public.agency_tier_tokens
  ADD CONSTRAINT agency_tier_tokens_max_seats_by_tier CHECK (
    (agency_type = '100' AND max_seats >= 1 AND max_seats <= 100)
    OR (agency_type = '250' AND max_seats >= 1 AND max_seats <= 250)
    OR (agency_type = '500' AND max_seats >= 1 AND max_seats <= 500)
  );
