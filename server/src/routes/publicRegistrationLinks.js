import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { PLANS, normalizePlanId } from '../data/plans.js';

const router = Router();

/**
 * Public: validate a signup ref code (no auth). Used to show “You’ll get … plan” on /signup.
 */
router.get('/:code', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Server unavailable.' });
    }
    const code = String(req.params.code || '').trim();
    if (!code) {
      return res.status(400).json({ valid: false, error: 'EMPTY_CODE' });
    }
    const normalized = code.toUpperCase();
    const { data: link, error } = await supabaseAdmin
      .from('registration_links')
      .select('id, plan_id, max_uses, uses_count, expires_at, disabled')
      .eq('code', normalized)
      .maybeSingle();
    if (error) {
      return res.status(500).json({ valid: false, error: 'LOOKUP_FAILED' });
    }
    if (!link || link.disabled) {
      return res.json({ valid: false, error: 'INVALID_CODE' });
    }
    const now = Date.now();
    if (link.expires_at && new Date(link.expires_at).getTime() < now) {
      return res.json({ valid: false, error: 'EXPIRED' });
    }
    if (link.max_uses != null && link.uses_count >= link.max_uses) {
      return res.json({ valid: false, error: 'LINK_EXHAUSTED' });
    }
    const planId = normalizePlanId(link.plan_id);
    const plan = PLANS[planId];
    return res.json({
      valid: true,
      plan_id: planId,
      plan_name: plan?.name || planId,
    });
  } catch (e) {
    console.error('[publicRegistrationLinks]', e);
    return res.status(500).json({ valid: false, error: 'SERVER_ERROR' });
  }
});

export default router;
