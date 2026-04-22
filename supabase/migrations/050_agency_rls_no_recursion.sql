-- Fix "infinite recursion detected in policy for relation agencies" when selecting
-- `profiles` with embedded `agency` (PostgREST).
--
-- Cycle was:
--   agencies SELECT (member policy) → reads agency_members
--   agency_members RLS (owner policy) → subquery on agencies
--   → agencies SELECT again → loop
--
-- Owner checks now use `profiles` (same facts as owner_id on agencies, no agencies
-- subquery in the member/link policies).

DROP POLICY IF EXISTS "Agency owner sees own members" ON public.agency_members;
CREATE POLICY "Agency owner sees own members"
  ON public.agency_members FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.is_agency_owner = true
        AND p.agency_id = agency_members.agency_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.is_agency_owner = true
        AND p.agency_id = agency_members.agency_id
    )
  );

DROP POLICY IF EXISTS "Agency owner manages own links" ON public.agency_registration_links;
CREATE POLICY "Agency owner manages own links"
  ON public.agency_registration_links FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.is_agency_owner = true
        AND p.agency_id = agency_registration_links.agency_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.is_agency_owner = true
        AND p.agency_id = agency_registration_links.agency_id
    )
  );
