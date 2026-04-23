import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { findAdminPanelUserByUsername, getAdminPanelUserById } from '../services/adminCredentials.js';
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

    let panelUser;
    try {
      panelUser = await findAdminPanelUserByUsername(username, { requireActive: true });
    } catch (e) {
      console.error('[adminAuth/login] admin_panel_users', e);
      return res.status(503).json({
        error: 'NOT_INITIALIZED',
        message:
          'Could not load admin users. Apply Supabase migration 055_admin_panel_users_tier_token_multi_use.sql and restart the API.',
      });
    }
    if (!panelUser || !bcrypt.compareSync(password, panelUser.password_hash)) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' });
    }

    const token = signAdminToken({
      id: panelUser.id,
      username: panelUser.username,
      display_name: panelUser.display_name,
    });
    return res.json({
      token,
      username: panelUser.username,
      display_name: panelUser.display_name,
    });
  } catch (e) {
    console.error('[adminAuth/login]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

router.get('/me', requireAdminJwt, async (req, res) => {
  try {
    const row = await getAdminPanelUserById(req.adminAuth.sub);
    if (!row) {
      return res.status(503).json({ error: 'NOT_INITIALIZED' });
    }
    return res.json({ username: row.username, display_name: row.display_name });
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
    const new_username = req.body?.new_username != null ? String(req.body.new_username).trim().toLowerCase() : '';
    const new_password = String(req.body?.new_password || '');

    if (!current_password) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Current password is required.' });
    }

    const row = await getAdminPanelUserById(req.adminAuth.sub);
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
      .from('admin_panel_users')
      .update(updates)
      .eq('id', req.adminAuth.sub)
      .select('id, username, display_name, updated_at')
      .single();
    if (error) throw error;

    const token = signAdminToken({
      id: data.id,
      username: data.username,
      display_name: data.display_name,
    });
    return res.json({ ok: true, username: data.username, display_name: data.display_name, updated_at: data.updated_at, token });
  } catch (e) {
    console.error('[adminAuth/credentials]', e);
    const msg = e.message || '';
    if (msg.includes('duplicate') || e.code === '23505') {
      return res.status(409).json({ error: 'USERNAME_TAKEN', message: 'That username is already in use.' });
    }
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

export default router;
