import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase.js';

const ROW_ID = 1;
/** Seeded on first API boot when the table is empty (change in Admin → Account). */
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'AdminDemo!2026';

/**
 * Inserts the default demo admin row if missing. Safe to call on every server start.
 */
export async function ensureAdminCredentials() {
  if (!supabaseAdmin) return;
  try {
    const { data, error } = await supabaseAdmin.from('admin_app_credentials').select('id').eq('id', ROW_ID).maybeSingle();
    if (error) {
      console.warn('[admin] Could not read admin_app_credentials:', error.message);
      return;
    }
    if (data) return;
    const password_hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
    const { error: ins } = await supabaseAdmin.from('admin_app_credentials').insert({
      id: ROW_ID,
      username: DEFAULT_ADMIN_USERNAME,
      password_hash,
    });
    if (ins) {
      console.warn(
        '[admin] Could not seed admin_app_credentials:',
        ins.code,
        ins.message,
        ins.details || '',
        ins.hint || ''
      );
      return;
    }
    console.warn(
      `[admin] Seeded default admin login — username: ${DEFAULT_ADMIN_USERNAME} / password: ${DEFAULT_ADMIN_PASSWORD} (change under Admin → Account).`
    );
  } catch (e) {
    console.warn('[admin] ensureAdminCredentials:', e?.message || e);
  }
}

export async function getAdminCredentialsRow() {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('admin_app_credentials')
    .select('id, username, password_hash, updated_at')
    .eq('id', ROW_ID)
    .maybeSingle();
  if (error) {
    console.warn('[admin] getAdminCredentialsRow:', error.code, error.message);
    return null;
  }
  return data;
}
