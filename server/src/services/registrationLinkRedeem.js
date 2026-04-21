import { supabaseAdmin } from './supabase.js';

/**
 * @param {string} code
 * @param {string} userId
 * @returns {Promise<{ ok: boolean, plan_id?: string, error?: string }>}
 */
export async function redeemRegistrationLink(code, userId) {
  if (!supabaseAdmin) {
    return { ok: false, error: 'MISCONFIGURED' };
  }
  const { data, error } = await supabaseAdmin.rpc('redeem_registration_link', {
    p_code: String(code || '').trim(),
    p_user_id: userId,
  });
  if (error) {
    console.error('[redeem_registration_link]', error);
    return { ok: false, error: 'RPC_FAILED', message: error.message };
  }
  let row = data;
  if (typeof row === 'string') {
    try {
      row = JSON.parse(row);
    } catch {
      return { ok: false, error: 'INVALID_RESPONSE' };
    }
  }
  if (!row || typeof row !== 'object') {
    return { ok: false, error: 'INVALID_RESPONSE' };
  }
  if (row.ok === true) {
    return { ok: true, plan_id: row.plan_id };
  }
  return { ok: false, error: row.error || 'UNKNOWN' };
}
