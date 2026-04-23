-- Enforce agency max_seats and per-invite max_users at row level (prevents concurrent joins bypassing API checks).

CREATE OR REPLACE FUNCTION public.enforce_agency_member_seat_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  agency_cap integer;
  link_cap integer;
  agency_cnt integer;
  link_cnt integer;
  aid uuid;
  lid uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT NEW.is_active THEN
      RETURN NEW;
    END IF;
    aid := NEW.agency_id;
    lid := NEW.link_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT NEW.is_active THEN
      RETURN NEW;
    END IF;
    IF OLD.is_active
       AND NEW.is_active
       AND OLD.agency_id = NEW.agency_id
       AND (OLD.link_id IS NOT DISTINCT FROM NEW.link_id) THEN
      RETURN NEW;
    END IF;
    aid := NEW.agency_id;
    lid := NEW.link_id;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT a.max_seats
  INTO agency_cap
  FROM public.agencies a
  WHERE a.id = aid
  FOR UPDATE;

  IF agency_cap IS NULL THEN
    RAISE EXCEPTION 'AGENCY_NOT_FOUND';
  END IF;

  SELECT COUNT(*)::integer
  INTO agency_cnt
  FROM public.agency_members m
  WHERE m.agency_id = aid
    AND m.is_active = true
    AND (TG_OP = 'INSERT' OR m.id IS DISTINCT FROM NEW.id);

  IF agency_cnt + 1 > agency_cap THEN
    RAISE EXCEPTION 'AGENCY_FULL';
  END IF;

  IF lid IS NOT NULL THEN
    SELECT arl.max_users
    INTO link_cap
    FROM public.agency_registration_links arl
    WHERE arl.id = lid
      AND arl.agency_id = aid
    FOR UPDATE;

    IF link_cap IS NULL THEN
      RAISE EXCEPTION 'INVALID_AGENCY_LINK';
    END IF;

    SELECT COUNT(*)::integer
    INTO link_cnt
    FROM public.agency_members m
    WHERE m.link_id = lid
      AND m.is_active = true
      AND (TG_OP = 'INSERT' OR m.id IS DISTINCT FROM NEW.id);

    IF link_cnt + 1 > link_cap THEN
      RAISE EXCEPTION 'LINK_FULL';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_agency_member_seat_limits ON public.agency_members;
CREATE TRIGGER trigger_enforce_agency_member_seat_limits
  BEFORE INSERT OR UPDATE ON public.agency_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_agency_member_seat_limits();
