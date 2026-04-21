-- Admin registration invite links: grant plan tier on first-time user redeem (server-side RPC).

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create table if not exists public.registration_links (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan_id text not null,
  max_uses int,
  uses_count int not null default 0,
  expires_at timestamptz,
  disabled boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint registration_links_plan_check
    check (plan_id in ('personal', 'advanced', 'ultimate')),
  constraint registration_links_max_uses_check
    check (max_uses is null or max_uses > 0),
  constraint registration_links_uses_nonnegative check (uses_count >= 0)
);

create index if not exists idx_registration_links_disabled_created
  on public.registration_links (disabled, created_at desc);

create table if not exists public.registration_redemptions (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.registration_links (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  constraint registration_redemptions_user_unique unique (user_id)
);

create index if not exists idx_registration_redemptions_link
  on public.registration_redemptions (link_id);

alter table public.registration_links enable row level security;
alter table public.registration_redemptions enable row level security;

-- No policies: only service_role / backend uses these tables.

create or replace function public.redeem_registration_link(p_code text, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  if exists (select 1 from public.registration_redemptions where user_id = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'ALREADY_REDEEMED');
  end if;

  select * into r
  from public.registration_links
  where upper(trim(code)) = upper(trim(p_code))
    and disabled = false
    and (expires_at is null or expires_at > now())
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'INVALID_CODE');
  end if;

  if r.max_uses is not null and r.uses_count >= r.max_uses then
    return jsonb_build_object('ok', false, 'error', 'LINK_EXHAUSTED');
  end if;

  insert into public.registration_redemptions (link_id, user_id)
  values (r.id, p_user_id);

  update public.registration_links
  set uses_count = uses_count + 1
  where id = r.id;

  update public.profiles
  set plan = r.plan_id,
      plan_updated_at = now()
  where id = p_user_id;

  return jsonb_build_object('ok', true, 'plan_id', r.plan_id);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'ALREADY_REDEEMED');
end;
$$;

revoke all on function public.redeem_registration_link(text, uuid) from public;
grant execute on function public.redeem_registration_link(text, uuid) to service_role;

notify pgrst, 'reload schema';
