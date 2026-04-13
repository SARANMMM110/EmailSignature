import { supabaseAdmin } from './supabase.js';

/**
 * Guarantees public.profiles has a row for this auth user (signatures.user_id FK targets profiles.id).
 * Safe for concurrent calls (duplicate insert → ignore 23505).
 */
export async function ensureUserProfile(user) {
  if (!supabaseAdmin || !user?.id) return;

  const { data, error: selErr } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (selErr) throw selErr;
  if (data) return;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.display_name ||
    null;
  const avatarUrl = user.user_metadata?.avatar_url || null;

  const { error: insErr } = await supabaseAdmin.from('profiles').insert({
    id: user.id,
    full_name: fullName,
    avatar_url: avatarUrl,
  });

  if (insErr && insErr.code !== '23505') throw insErr;
}
