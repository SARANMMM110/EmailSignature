import { supabaseAdmin } from '../services/supabase.js';
import { throwIfSupabaseError } from './supabaseRestError.js';

export async function countUserSignatures(userId) {
  const { count, error } = await supabaseAdmin
    .from('signatures')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  throwIfSupabaseError(error);
  return count ?? 0;
}

export async function countUserPalettes(userId) {
  const { count, error } = await supabaseAdmin
    .from('user_palettes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  throwIfSupabaseError(error);
  return count ?? 0;
}
