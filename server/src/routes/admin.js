import crypto from 'crypto';
import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { normalizePlanId, PLAN_ORDER } from '../data/plans.js';

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

export default router;
