import { create } from 'zustand';
import { supabase } from '../lib/supabase.js';

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
    const profile = data ?? null;
    // VITE_DEV_USER_PLAN_OVERRIDE — optional; plan gates are off in lib/plan.js during dev
    // const planOverride = import.meta.env.VITE_DEV_USER_PLAN_OVERRIDE?.trim().toLowerCase();
    // if (profile && (planOverride === 'pro' || planOverride === 'business')) {
    //   profile = { ...profile, plan: planOverride };
    // }
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
    const prev = get().profile;
    const snapshot = prev && prev.id === user.id ? { ...prev } : null;
    if (snapshot) {
      set({ profile: { ...snapshot, ...partial } });
    }
    const { error } = await supabase.from('profiles').update(partial).eq('id', user.id);
    if (error) {
      if (snapshot) set({ profile: snapshot });
      return { error };
    }
    // Refresh in background so UI is not blocked on a second round-trip
    void get().fetchProfile();
    return { error };
  },
}));
