import crypto from 'crypto';
import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { normalizePlanId, PLAN_ORDER, PLAN_IDS } from '../data/plans.js';

const router = Router();

function randomLinkCode(length = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

router.get('/stats', async (_req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const { count: linksTotal, error: e1 } = await supabaseAdmin
      .from('registration_links')
      .select('*', { count: 'exact', head: true });
    if (e1) throw e1;
    const { count: redemptionsTotal, error: e2 } = await supabaseAdmin
      .from('registration_redemptions')
      .select('*', { count: 'exact', head: true });
    if (e2) throw e2;
    const nowIso = new Date().toISOString();
    const { data: links, error: e3 } = await supabaseAdmin
      .from('registration_links')
      .select('id, max_uses, uses_count, expires_at, disabled');
    if (e3) throw e3;
    let activeLinks = 0;
    for (const row of links || []) {
      if (row.disabled) continue;
      if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) continue;
      if (row.max_uses != null && row.uses_count >= row.max_uses) continue;
      activeLinks += 1;
    }
    return res.json({
      linksTotal: linksTotal ?? 0,
      redemptionsTotal: redemptionsTotal ?? 0,
      activeLinks,
      now: nowIso,
    });
  } catch (e) {
    console.error('[admin/stats]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

router.get('/registration-links', async (_req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const { data, error } = await supabaseAdmin
      .from('registration_links')
      .select('id, code, plan_id, max_uses, uses_count, expires_at, disabled, created_at, created_by')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ links: data || [] });
  } catch (e) {
    console.error('[admin/registration-links GET]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

router.post('/registration-links', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const plan_id = normalizePlanId(req.body?.plan_id);
    if (!PLAN_ORDER.includes(plan_id)) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid plan_id.' });
    }
    let maxUses = req.body?.max_uses;
    if (maxUses === '' || maxUses === undefined || maxUses === null) {
      maxUses = null;
    } else {
      maxUses = Number(maxUses);
      if (!Number.isFinite(maxUses) || maxUses < 1) {
        return res.status(400).json({ error: 'BAD_REQUEST', message: 'max_uses must be a positive number or omitted for unlimited.' });
      }
    }
    let expires_at = req.body?.expires_at;
    if (expires_at === '' || expires_at === undefined) {
      expires_at = null;
    } else if (expires_at) {
      const t = new Date(expires_at).getTime();
      if (Number.isNaN(t)) {
        return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid expires_at.' });
      }
      expires_at = new Date(expires_at).toISOString();
    }

    let code = randomLinkCode(8);
    const created_by = req.user?.id || null;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const { data, error } = await supabaseAdmin
        .from('registration_links')
        .insert({
          code,
          plan_id,
          max_uses: maxUses,
          expires_at,
          created_by,
        })
        .select('id, code, plan_id, max_uses, uses_count, expires_at, disabled, created_at')
        .single();
      if (!error && data) {
        return res.status(201).json({ link: data });
      }
      if (error?.code === '23505') {
        code = randomLinkCode(8);
        continue;
      }
      throw error;
    }
    return res.status(500).json({ error: 'CODE_COLLISION', message: 'Could not allocate a unique code.' });
  } catch (e) {
    console.error('[admin/registration-links POST]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

router.patch('/registration-links/:id', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const { id } = req.params;
    const patch = {};
    if (typeof req.body?.disabled === 'boolean') {
      patch.disabled = req.body.disabled;
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'No valid fields to update.' });
    }
    const { data, error } = await supabaseAdmin
      .from('registration_links')
      .update(patch)
      .eq('id', id)
      .select('id, code, plan_id, max_uses, uses_count, expires_at, disabled, created_at')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
    return res.json({ link: data });
  } catch (e) {
    console.error('[admin/registration-links PATCH]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

router.delete('/registration-links/:id', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const { error } = await supabaseAdmin.from('registration_links').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(204).send();
  } catch (e) {
    console.error('[admin/registration-links DELETE]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

// ─── Admin-provisioned app users (main product accounts from Agencies page) ─

router.get('/app-users', async (_req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const { data, error } = await supabaseAdmin
      .from('admin_provisioned_app_users')
      .select('id, user_id, email, full_name, is_disabled, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ users: data || [] });
  } catch (e) {
    console.error('[admin/app-users GET]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

/** Create a Supabase Auth app user (main product) with Silver tier (`advanced`) on `profiles`. */
router.post('/app-users', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const email = String(req.body?.email || '').trim().toLowerCase();
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    if (!username || username.length < 2) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Username must be at least 2 characters.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Valid email is required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Password must be at least 8 characters.' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: username },
    });

    if (authError) {
      const msg = String(authError.message || '');
      if (/already|registered|exists/i.test(msg) || authError.status === 422) {
        return res.status(409).json({ error: 'DUPLICATE', message: 'An account with this email already exists.' });
      }
      console.error('[admin/app-users POST] auth', authError);
      return res.status(400).json({ error: 'AUTH_ERROR', message: msg || 'Could not create user.' });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return res.status(500).json({ error: 'SERVER_ERROR', message: 'User id missing after create.' });
    }

    const planUpdatedAt = new Date().toISOString();
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        plan: PLAN_IDS.ADVANCED,
        plan_updated_at: planUpdatedAt,
        full_name: username,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('[admin/app-users POST] profile', profileError);
      return res.status(500).json({
        error: 'PROFILE_ERROR',
        message: 'User was created but the profile plan could not be set. Fix manually in Supabase.',
      });
    }

    const { error: regErr } = await supabaseAdmin.from('admin_provisioned_app_users').insert({
      user_id: userId,
      email,
      full_name: username,
      is_disabled: false,
    });
    if (regErr) {
      console.error('[admin/app-users POST] registry', regErr);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(500).json({
        error: 'REGISTRY_ERROR',
        message:
          regErr.message?.includes('does not exist') || regErr.code === '42P01'
            ? 'Database migration missing: apply 058_admin_provisioned_app_users.sql (admin_provisioned_app_users).'
            : 'Could not record the new user; creation was rolled back.',
      });
    }

    return res.status(201).json({
      user: { id: userId, email: authData.user.email, full_name: username, plan: PLAN_IDS.ADVANCED },
    });
  } catch (e) {
    console.error('[admin/app-users POST]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

router.patch('/app-users/:userId', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const userId = String(req.params.userId || '').trim();
    if (!userId) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing user id.' });
    }
    if (typeof req.body?.is_disabled !== 'boolean') {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Body must include is_disabled (boolean).' });
    }
    const disabled = req.body.is_disabled;

    const { data: row, error: fe } = await supabaseAdmin
      .from('admin_provisioned_app_users')
      .select('id, user_id, is_disabled')
      .eq('user_id', userId)
      .maybeSingle();
    if (fe) throw fe;
    if (!row) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User is not in the provisioned list.' });
    }

    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: disabled ? '876600h' : 'none',
    });
    if (authErr) {
      console.error('[admin/app-users PATCH] auth', authErr);
      return res.status(400).json({
        error: 'AUTH_ERROR',
        message: authErr.message || 'Could not update sign-in status.',
      });
    }

    const { data: updated, error: ue } = await supabaseAdmin
      .from('admin_provisioned_app_users')
      .update({ is_disabled: disabled })
      .eq('id', row.id)
      .select('id, user_id, email, full_name, is_disabled, created_at')
      .single();
    if (ue) throw ue;
    return res.json({ user: updated });
  } catch (e) {
    console.error('[admin/app-users PATCH]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

router.delete('/app-users/:userId', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED' });
    }
    const userId = String(req.params.userId || '').trim();
    if (!userId) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing user id.' });
    }
    const { data: row, error: fe } = await supabaseAdmin
      .from('admin_provisioned_app_users')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (fe) throw fe;
    if (!row) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User is not in the provisioned list.' });
    }

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (delErr) {
      console.error('[admin/app-users DELETE] auth', delErr);
      return res.status(400).json({
        error: 'AUTH_ERROR',
        message: delErr.message || 'Could not delete user.',
      });
    }
    return res.status(204).send();
  } catch (e) {
    console.error('[admin/app-users DELETE]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

export default router;
