-- Allow changing plan when the user signs in with a different `?ref=` code than their first redeem.
-- Moves the single registration_redemptions row to the new link (adjusts uses_count on old/new links)
-- and sets profiles.plan from the new link — no "permanent first link only" behavior.

create or replace function public.redeem_registration_link(p_code text, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  existing_link_id uuid;
  first_id uuid;
  second_id uuid;
begin
  if exists (
    select 1
    from public.profiles
    where id = p_user_id
      and agency_id is not null
      and coalesce(is_agency_owner, false) = false
  ) then
    return jsonb_build_object(
      'ok', false,
      'error', 'SKIP_AGENCY_USER',
      'message', 'Your plan is set by your agency membership; this signup ref was not applied.'
    );
  end if;

  select link_id
  into existing_link_id
  from public.registration_redemptions
  where user_id = p_user_id
  for update;

  select *
  into r
  from public.registration_links
  where upper(trim(code)) = upper(trim(p_code))
    and disabled = false
    and (expires_at is null or expires_at > now());

  if not found then
    return jsonb_build_object('ok', false, 'error', 'INVALID_CODE');
  end if;

  if existing_link_id is not null and existing_link_id = r.id then
    perform 1 from public.registration_links where id = r.id for update;
    insert into public.profiles (id, plan, plan_updated_at, updated_at)
    values (p_user_id, r.plan_id, now(), now())
    on conflict (id) do update set
      plan = excluded.plan,
      plan_updated_at = excluded.plan_updated_at,
      updated_at = now();
    return jsonb_build_object('ok', true, 'plan_id', r.plan_id, 'same_link', true);
  end if;

  if r.max_uses is not null and r.uses_count >= r.max_uses then
    return jsonb_build_object('ok', false, 'error', 'LINK_EXHAUSTED');
  end if;

  if existing_link_id is not null then
    first_id := least(existing_link_id, r.id);
    second_id := greatest(existing_link_id, r.id);
    perform 1 from public.registration_links where id = first_id for update;
    if first_id is distinct from second_id then
      perform 1 from public.registration_links where id = second_id for update;
    end if;

    select *
    into r
    from public.registration_links
    where id = r.id;

    if r.max_uses is not null and r.uses_count >= r.max_uses then
      return jsonb_build_object('ok', false, 'error', 'LINK_EXHAUSTED');
    end if;

    update public.registration_links
    set uses_count = greatest(0, uses_count - 1)
    where id = existing_link_id;

    update public.registration_redemptions
    set link_id = r.id, redeemed_at = now()
    where user_id = p_user_id;

    update public.registration_links
    set uses_count = uses_count + 1
    where id = r.id;

    insert into public.profiles (id, plan, plan_updated_at, updated_at)
    values (p_user_id, r.plan_id, now(), now())
    on conflict (id) do update set
      plan = excluded.plan,
      plan_updated_at = excluded.plan_updated_at,
      updated_at = now();

    return jsonb_build_object('ok', true, 'plan_id', r.plan_id, 'switched_link', true);
  end if;

  perform 1 from public.registration_links where id = r.id for update;

  select *
  into r
  from public.registration_links
  where id = r.id;

  if r.max_uses is not null and r.uses_count >= r.max_uses then
    return jsonb_build_object('ok', false, 'error', 'LINK_EXHAUSTED');
  end if;

  insert into public.registration_redemptions (link_id, user_id)
  values (r.id, p_user_id);

  update public.registration_links
  set uses_count = uses_count + 1
  where id = r.id;

  insert into public.profiles (id, plan, plan_updated_at, updated_at)
  values (p_user_id, r.plan_id, now(), now())
  on conflict (id) do update set
    plan = excluded.plan,
    plan_updated_at = excluded.plan_updated_at,
    updated_at = now();

  return jsonb_build_object('ok', true, 'plan_id', r.plan_id);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'ALREADY_REDEEMED');
end;
$$;

revoke all on function public.redeem_registration_link(text, uuid) from public;
grant execute on function public.redeem_registration_link(text, uuid) to service_role;

notify pgrst, 'reload schema';
