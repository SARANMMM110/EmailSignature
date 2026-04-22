-- Allow active agency members to SELECT their organization row (needed for client
-- `profiles` → `agencies` embed under RLS). Owners are already covered by existing policy.
CREATE POLICY "Agency members can read their organization"
  ON public.agencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.agency_members am
      WHERE am.agency_id = agencies.id
        AND am.member_id = auth.uid()
        AND am.is_active = true
    )
  );
