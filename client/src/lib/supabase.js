import { createClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client (anon key + user session).
 * Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from `.env`.
 */
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[Signature Studio] Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env (see .env.example). Auth is disabled until then.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
