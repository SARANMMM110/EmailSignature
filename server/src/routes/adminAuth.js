import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { ensureAdminCredentials, getAdminCredentialsRow } from '../services/adminCredentials.js';
import { signAdminToken } from '../services/adminJwt.js';
import { requireAdminJwt } from '../middleware/requireAdminJwt.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Server database is not configured.' });
    }
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    if (!username || !password) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Username and password are required.' });
    }
    await ensureAdminCredentials();
    const row = await getAdminCredentialsRow();
    if (!row) {
      return res.status(503).json({
        error: 'NOT_INITIALIZED',
        message:
          'Admin credentials row is missing. Apply Supabase migrations (including 046_seed_admin_app_credentials.sql), ensure SUPABASE_SERVICE_ROLE_KEY is set, then restart the API.',
      });
    }
    const userOk = row.username.toLowerCase() === username.toLowerCase();
    const passOk = bcrypt.compareSync(password, row.password_hash);
    if (!userOk || !passOk) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' });
    }
    const token = signAdminToken();
    return res.json({ token, username: row.username });
  } catch (e) {
    console.error('[adminAuth/login]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

router.get('/me', requireAdminJwt, async (_req, res) => {
  try {
    const row = await getAdminCredentialsRow();
    if (!row) {
      return res.status(503).json({ error: 'NOT_INITIALIZED' });
    }
    return res.json({ username: row.username });
  } catch (e) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

router.patch('/credentials', requireAdminJwt, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const current_password = String(req.body?.current_password || '');
    const new_username = req.body?.new_username != null ? String(req.body.new_username).trim() : '';
    const new_password = String(req.body?.new_password || '');

    if (!current_password) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Current password is required.' });
    }

    const row = await getAdminCredentialsRow();
    if (!row) {
      return res.status(503).json({ error: 'NOT_INITIALIZED' });
    }
    const passOk = bcrypt.compareSync(current_password, row.password_hash);
    if (!passOk) {
      return res.status(401).json({ error: 'INVALID_PASSWORD', message: 'Current password is incorrect.' });
    }

    const hasUsername = new_username.length > 0;
    const hasPassword = new_password.length > 0;
    if (!hasUsername && !hasPassword) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Provide new_username and/or new_password to update.',
      });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (hasUsername) {
      if (new_username.length < 2) {
        return res.status(400).json({ error: 'BAD_REQUEST', message: 'Username must be at least 2 characters.' });
      }
      updates.username = new_username;
    }
    if (hasPassword) {
      if (new_password.length < 8) {
        return res.status(400).json({ error: 'BAD_REQUEST', message: 'New password must be at least 8 characters.' });
      }
      updates.password_hash = bcrypt.hashSync(new_password, 10);
    }

    const { data, error } = await supabaseAdmin
      .from('admin_app_credentials')
      .update(updates)
      .eq('id', 1)
      .select('username, updated_at')
      .single();
    if (error) throw error;

    const token = signAdminToken();
    return res.json({ ok: true, username: data.username, updated_at: data.updated_at, token });
  } catch (e) {
    console.error('[adminAuth/credentials]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

export default router;
