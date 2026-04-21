import { create } from 'zustand';
import { supabase } from '../lib/supabase.js';
import { normalizePlanId } from '../data/plans.js';

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

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,

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
      ...(session ? {} : { profile: null }),
    });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!supabase || !user) {
      set({ profile: null });
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) {
      console.warn('[auth] fetchProfile:', error.message);
      set({ profile: null });
      return;
    }
    let profile = data ?? null;
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
    set({ profile });
  },

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true, loading: true });
    try {
      if (!supabase) {
        set({ user: null, session: null, profile: null });
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      get().setSession(session);
      if (session?.user) {
        await get().fetchProfile();
      }
      supabase.auth.onAuthStateChange(async (_event, session) => {
        get().setSession(session);
        if (session?.user) {
          await get().fetchProfile();
        } else {
          set({ profile: null });
        }
      });
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogle: async () => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/dashboard` },
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

  signupWithEmail: async (email, password, fullName) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.'), needsEmailConfirmation: false };
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    if (!error && data.session) {
      get().setSession(data.session);
      await get().fetchProfile();
    }
    return {
      error,
      needsEmailConfirmation: !error && !data.session,
    };
  },

  logout: async () => {
    if (supabase) await supabase.auth.signOut();
    get().setSession(null);
    set({ profile: null });
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
