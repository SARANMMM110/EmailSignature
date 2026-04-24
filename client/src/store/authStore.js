import { create } from 'zustand';
import { supabase } from '../lib/supabase.js';
import { clearStoredRegistrationRef } from '../lib/registrationRef.js';
import { clearAgencyJoinLinkToken } from '../lib/agencyJoinLink.js';
import { normalizePlanId } from '../data/plans.js';

const SIGN_OUT_NETWORK_MS = 12_000;

async function clearSupabaseSession() {
  if (!supabase) return;
  const globalOut = supabase.auth.signOut();
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('signOut_timeout')), SIGN_OUT_NETWORK_MS);
  });
  try {
    const { error } = await Promise.race([globalOut, timeout]);
    if (error) console.warn('[auth] signOut:', error.message || error);
  } catch (e) {
    const msg = e?.message || String(e);
    console.warn('[auth] signOut failed or timed out:', msg);
    try {
      const { error: localErr } = await supabase.auth.signOut({ scope: 'local' });
      if (localErr) console.warn('[auth] signOut(local):', localErr.message || localErr);
    } catch (e2) {
      console.warn('[auth] signOut(local) failed:', e2?.message || e2);
    }
  }
}

/** Columns the client may PATCH on `public.profiles` (migrations 001 + 006). */
const PROFILE_PATCH_KEYS = new Set([
  'first_name',
  'last_name',
  'full_name',
  'job_title',
  'phone',
  'address',
  'avatar_url',
  'logo_url',
  'language',
]);

function sanitizeProfilePatch(partial) {
  if (!partial || typeof partial !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(partial)) {
    if (!PROFILE_PATCH_KEYS.has(k) || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

const AGENCY_EMBED = `
  *,
  agency:agencies!profiles_agency_id_fkey (
    id,
    agency_type,
    agency_name,
    max_seats,
    seats_used,
    is_active
  ),
  agency_member_rows:agency_members!agency_members_member_id_fkey (
    assigned_plan,
    is_active
  )
`;

function deriveAgencyFields(profile) {
  if (!profile) {
    return {
      isAgencyOwner: false,
      isAgencyMember: false,
      agencyInfo: null,
    };
  }
  const rawAgency = profile.agency;
  const agencyInfo = Array.isArray(rawAgency) ? rawAgency[0] ?? null : rawAgency ?? null;
  const isAgencyOwner = profile.is_agency_owner === true;
  const hasMemberEmbed = Object.prototype.hasOwnProperty.call(profile, 'agency_member_rows');
  const rawRows = profile.agency_member_rows;
  const rowList = hasMemberEmbed
    ? Array.isArray(rawRows)
      ? rawRows
      : rawRows
        ? [rawRows]
        : []
    : null;
  const activeMemberRow = rowList?.find((r) => r && r.is_active !== false);
  const isAgencyMember = hasMemberEmbed
    ? Boolean(profile.agency_id) && !isAgencyOwner && Boolean(activeMemberRow)
    : Boolean(profile.agency_id) && !isAgencyOwner;
  return { isAgencyOwner, isAgencyMember, agencyInfo };
}

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,
  isAgencyOwner: false,
  isAgencyMember: false,
  agencyInfo: null,

  setSession: (session) => {
    const token = session?.access_token;
    if (token) {
      localStorage.setItem('sb-access-token', token);
    } else {
      localStorage.removeItem('sb-access-token');
    }
    set({
      session,
      user: session?.user ?? null,
      ...(session
        ? {}
        : {
            profile: null,
            isAgencyOwner: false,
            isAgencyMember: false,
            agencyInfo: null,
          }),
    });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!supabase || !user) {
      set({
        profile: null,
        isAgencyOwner: false,
        isAgencyMember: false,
        agencyInfo: null,
      });
      return;
    }
    let { data, error } = await supabase
      .from('profiles')
      .select(AGENCY_EMBED)
      .eq('id', user.id)
      .maybeSingle();
    if (error) {
      const msg = error.message || '';
      const retry =
        /foreign key|relationship|schema cache|PGRST204|Could not find a relationship/i.test(msg) ||
        error.code === 'PGRST204';
      if (retry) {
        ({ data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle());
      }
    }
    if (error) {
      console.warn('[auth] fetchProfile:', error.message);
      set({
        profile: null,
        isAgencyOwner: false,
        isAgencyMember: false,
        agencyInfo: null,
      });
      return;
    }
    let profile = data ?? null;
    /** Keep `profiles.plan` aligned with agency invite tier when the member row is source of truth. */
    if (profile) {
      const rawRows = profile.agency_member_rows;
      const rowList = Array.isArray(rawRows) ? rawRows : rawRows ? [rawRows] : [];
      const activeRow = rowList.find((r) => r && r.is_active !== false);
      const fromLink = activeRow?.assigned_plan ? normalizePlanId(activeRow.assigned_plan) : null;
      const dbPlan = normalizePlanId(profile.plan);
      const isMember = Boolean(profile.agency_id) && profile.is_agency_owner !== true;
      if (isMember && fromLink && fromLink !== dbPlan) {
        const nowIso = new Date().toISOString();
        const { error: syncErr } = await supabase
          .from('profiles')
          .update({ plan: fromLink, plan_updated_at: nowIso, updated_at: nowIso })
          .eq('id', user.id);
        if (!syncErr) {
          profile = { ...profile, plan: fromLink };
        } else {
          console.warn('[auth] sync profiles.plan from agency_members:', syncErr.message);
        }
      }
    }
    /**
     * Dev-only: VITE_DEV_USER_PLAN_OVERRIDE replaces `profiles.plan` in the UI (and plan gates).
     * If set to `pro` / `advanced` while the DB has `ultimate` (e.g. after an invite link), Settings will look wrong.
     * Production builds never apply this. Remove the env var to see the real database tier.
     */
    if (profile && import.meta.env.DEV) {
      const planOverride = import.meta.env.VITE_DEV_USER_PLAN_OVERRIDE?.trim().toLowerCase();
      const allowedOverride = new Set(['personal', 'advanced', 'ultimate', 'free', 'pro', 'business']);
      if (planOverride && allowedOverride.has(planOverride)) {
        const fromDb = normalizePlanId(profile.plan);
        const forced = normalizePlanId(planOverride);
        if (fromDb !== forced) {
          console.warn(
            `[auth] VITE_DEV_USER_PLAN_OVERRIDE="${planOverride}" forces UI plan to "${forced}" but profiles.plan in DB is "${fromDb}". Remove it from client/.env and restart Vite so invite / Stripe tiers show correctly.`
          );
          profile = { ...profile, plan: forced, _devPlanUiOverride: { databasePlan: fromDb } };
        }
      }
    }
    const agencyDerived = deriveAgencyFields(profile);
    set({ profile, ...agencyDerived });
  },

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true, loading: true });
    try {
      if (!supabase) {
        set({
          user: null,
          session: null,
          profile: null,
          isAgencyOwner: false,
          isAgencyMember: false,
          agencyInfo: null,
        });
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      get().setSession(session);
      if (session?.user) {
        await get().fetchProfile();
      }
      supabase.auth.onAuthStateChange(async (event, session) => {
        const prevUserId = get().session?.user?.id ?? null;
        get().setSession(session);
        if (!session?.user) {
          set({
            profile: null,
            isAgencyOwner: false,
            isAgencyMember: false,
            agencyInfo: null,
          });
          return;
        }
        const nextUserId = session.user.id;
        const sameUser = prevUserId != null && prevUserId === nextUserId;
        /** Password change / token refresh / user patch — auth user changes but `profiles` row is unchanged; skip slow refetch. */
        const skipProfileRefetch =
          sameUser &&
          (event === 'TOKEN_REFRESHED' ||
            event === 'USER_UPDATED' ||
            (event === 'SIGNED_IN' && prevUserId !== null));
        if (skipProfileRefetch) {
          return;
        }
        await get().fetchProfile();
      });
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogle: async (redirectPath) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path =
      typeof redirectPath === 'string' && redirectPath.startsWith('/') ? redirectPath : '/dashboard';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}${path}` },
    });
    return { error };
  },

  loginWithEmail: async (email, password) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.session) {
      get().setSession(data.session);
      await get().fetchProfile();
    }
    return { error };
  },

  /**
   * Email/password accounts: verifies current password, then sets a new one.
   * OAuth-only (no `email` identity): skips verification and sets password so email sign-in can be used too.
   */
  changePassword: async (currentPassword, newPassword) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }
    const user = get().user;
    const email = user?.email;
    if (!email) {
      return { error: new Error('No email on this account.') };
    }
    const next = String(newPassword || '');
    if (next.length < 8) {
      return { error: new Error('New password must be at least 8 characters.') };
    }
    const identities = user?.identities || [];
    const hasEmailIdentity = identities.some((i) => i.provider === 'email');

    if (hasEmailIdentity) {
      const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password: String(currentPassword || ''),
      });
      if (signErr) {
        const msg = String(signErr.message || '');
        const friendly =
          /invalid login|invalid credentials|wrong password/i.test(msg) ? 'Current password is incorrect.' : msg;
        return { error: new Error(friendly || 'Could not verify current password.') };
      }
      if (signData?.session) {
        get().setSession(signData.session);
      }
    }

    const { error: upErr } = await supabase.auth.updateUser({ password: next });
    if (upErr) {
      return { error: new Error(upErr.message || 'Could not update password.') };
    }

    const {
      data: { session: refreshed },
    } = await supabase.auth.getSession();
    if (refreshed) {
      get().setSession(refreshed);
    }
    return { error: null };
  },

  signupWithEmail: async (email, password, fullName, meta = {}) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const agencyJoinToken = String(meta.agencyJoinToken || '').trim();
    const emailRedirectTo =
      agencyJoinToken !== ''
        ? `${origin}/join?agency_link=${encodeURIComponent(agencyJoinToken)}`
        : `${origin}/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { full_name: fullName },
      },
    });
    if (error) {
      return { error };
    }
    if (!data.session) {
      return {
        error: new Error(
          'No session after sign-up. Try Sign in with the same email and password, or turn off “Confirm email” in Supabase → Authentication → Providers → Email so new accounts can sign in immediately.'
        ),
      };
    }
    get().setSession(data.session);
    await get().fetchProfile();
    return { error: null };
  },

  logout: async () => {
    try {
      await clearSupabaseSession();
    } finally {
      clearStoredRegistrationRef();
      clearAgencyJoinLinkToken();
      get().setSession(null);
      set({
        profile: null,
        isAgencyOwner: false,
        isAgencyMember: false,
        agencyInfo: null,
      });
    }
  },

  updateProfile: async (partial) => {
    const user = get().user;
    if (!supabase || !user) {
      return { error: new Error('Not signed in.') };
    }
    const body = sanitizeProfilePatch(partial);
    if (Object.keys(body).length === 0) {
      return { error: new Error('Nothing to update.') };
    }
    const prev = get().profile;
    const snapshot = prev && prev.id === user.id ? { ...prev } : null;
    if (snapshot) {
      set({ profile: { ...snapshot, ...body } });
    }
    const { error } = await supabase.from('profiles').update(body).eq('id', user.id);
    if (error) {
      console.warn('[auth] updateProfile failed:', error.code, error.message, error.details || '', error.hint || '');
      if (snapshot) set({ profile: snapshot });
      return { error };
    }
    /** Await so callers (e.g. Settings) read a fresh row before showing success — avoids stale form / missing avatar. */
    await get().fetchProfile();
    return { error: null };
  },
}));
