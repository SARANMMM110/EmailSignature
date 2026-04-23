import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase.js';

const LEGACY_ROW_ID = 1;

/**
 * Legacy single-row admin (045/046). Kept for DBs that have not applied migration 055 yet.
 */
export async function ensureAdminCredentials() {
  if (!supabaseAdmin) return;
  try {
    const { data, error } = await supabaseAdmin.from('admin_app_credentials').select('id').eq('id', LEGACY_ROW_ID).maybeSingle();
    if (error) {
      console.warn('[admin] Could not read admin_app_credentials:', error.message);
      return;
    }
    if (data) return;
    const password_hash = bcrypt.hashSync('AdminDemo!2026', 10);
    const { error: ins } = await supabaseAdmin.from('admin_app_credentials').insert({
      id: LEGACY_ROW_ID,
      username: 'admin',
      password_hash,
    });
    if (ins) {
      console.warn('[admin] Could not seed admin_app_credentials:', ins.message);
      return;
    }
    console.warn('[admin] Seeded legacy admin row (username: admin). Prefer admin_panel_users after migration 055.');
  } catch (e) {
    console.warn('[admin] ensureAdminCredentials:', e?.message || e);
  }
}

export async function findAdminPanelUserByUsername(username, { requireActive = false } = {}) {
  if (!supabaseAdmin) return null;
  const u = String(username || '').trim().toLowerCase();
  if (!u) return null;
  let q = supabaseAdmin
    .from('admin_panel_users')
    .select('id, username, display_name, password_hash, is_active')
    .eq('username', u);
  if (requireActive) {
    q = q.eq('is_active', true);
  }
  const { data, error } = await q.maybeSingle();
  if (error) {
    const err = new Error(error.message || 'admin_panel_users query failed');
    err.code = error.code;
    err.details = error;
    throw err;
  }
  return data;
}

export async function getAdminPanelUserById(id) {
  if (!supabaseAdmin || !id) return null;
  const { data, error } = await supabaseAdmin
    .from('admin_panel_users')
    .select('id, username, display_name, email, password_hash, is_active, updated_at')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.warn('[admin] getAdminPanelUserById:', error.message);
    return null;
  }
  return data;
}

/** @deprecated Use findAdminPanelUserByUsername / getAdminPanelUserById */
export async function getAdminCredentialsRow() {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('admin_app_credentials')
    .select('id, username, password_hash, updated_at')
    .eq('id', LEGACY_ROW_ID)
    .maybeSingle();
  if (error) {
    console.warn('[admin] getAdminCredentialsRow:', error.code, error.message);
    return null;
  }
  return data;
}
