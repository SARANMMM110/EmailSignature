-- Three-tier plans (BonusBuilder) + optional Stripe billing columns.
-- Uses 043_* so it does not collide with existing 002_seed_templates_banners.sql.

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  alter column plan set default 'personal';

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('personal', 'advanced', 'ultimate', 'free', 'pro', 'business'));

-- Stripe / subscription metadata (nullable until checkout is wired)
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan_interval text,
  add column if not exists plan_expires_at timestamptz,
  add column if not exists plan_updated_at timestamptz default now();

alter table public.profiles
  drop constraint if exists profiles_plan_interval_check;

alter table public.profiles
  add constraint profiles_plan_interval_check
  check (plan_interval is null or plan_interval in ('monthly', 'yearly'));

create index if not exists idx_profiles_stripe_customer
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- Map legacy enum values to new canonical ids (CHECK still allows old values during rollout)
update public.profiles set plan = 'personal' where plan = 'free';
update public.profiles set plan = 'advanced' where plan = 'pro';
update public.profiles set plan = 'ultimate' where plan = 'business';

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('personal', 'advanced', 'ultimate'));
