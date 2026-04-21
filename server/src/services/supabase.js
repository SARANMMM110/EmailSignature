import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** `server/.env` — works when Node is started from repo root (e.g. `node server/src/scripts/seedTemplates.js`). */
const serverEnvPath = path.join(__dirname, '..', '..', '.env');

dotenv.config();
dotenv.config({ path: serverEnvPath });

const url = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anonKey = process.env.SUPABASE_ANON_KEY?.trim();

if (!url || !serviceRoleKey) {
  console.warn(
    'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — admin DB operations will fail until set.'
  );
}

if (!url || !anonKey) {
  console.warn(
    'SUPABASE_URL or SUPABASE_ANON_KEY missing — server anon client unavailable (optional for most routes).'
  );
}

const adminOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
};

const anonOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
};

/** Service role client — bypasses RLS. Use only on the server, never expose the key. */
export const supabaseAdmin =
  url && serviceRoleKey ? createClient(url, serviceRoleKey, adminOptions) : null;

/** Anon key client — same access as the browser with RLS enforced. */
export const supabaseAnon =
  url && anonKey ? createClient(url, anonKey, anonOptions) : null;

export function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'signature-images';
}
