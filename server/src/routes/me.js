import { Router } from 'express';
import { redeemRegistrationLink } from '../services/registrationLinkRedeem.js';
import { supabaseAdmin } from '../services/supabase.js';
import { normalizePlanId } from '../data/plans.js';

const router = Router();

/**
 * Align profiles.plan with the tier on the registration link this user already redeemed.
 * Fixes drift (e.g. skipped redeem while agency owner, or stale UI) without consuming a new link.
 * Skips agency members — their tier comes from the org, not signup refs.
 */
router.post('/sync-registration-plan', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!supabaseAdmin) {
      return res.status(503).json({ ok: false, error: 'MISCONFIGURED' });
    }

    const { data: prof, error: pe } = await supabaseAdmin
      .from('profiles')
      .select('plan, agency_id, is_agency_owner')
      .eq('id', userId)
      .maybeSingle();
    if (pe) throw pe;
    if (!prof) {
      return res.status(404).json({ ok: false, error: 'NO_PROFILE' });
    }

    if (prof.agency_id && prof.is_agency_owner !== true) {
      return res.json({ ok: false, skipped: true, reason: 'AGENCY_MEMBER' });
    }

    const { data: red, error: re } = await supabaseAdmin
      .from('registration_redemptions')
      .select('link_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (re) throw re;
    if (!red?.link_id) {
      return res.json({ ok: false, error: 'NO_REDEMPTION' });
    }

    const { data: link, error: le } = await supabaseAdmin
      .from('registration_links')
      .select('plan_id')
      .eq('id', red.link_id)
      .maybeSingle();
    if (le) throw le;
    if (!link?.plan_id) {
      return res.json({ ok: false, error: 'LINK_NOT_FOUND' });
    }

    const target = normalizePlanId(link.plan_id);
    const current = normalizePlanId(prof.plan);
    if (current === target) {
      return res.json({ ok: true, plan_id: target, updated: false });
    }

    const nowIso = new Date().toISOString();
    const { error: ue } = await supabaseAdmin
      .from('profiles')
      .update({ plan: target, plan_updated_at: nowIso, updated_at: nowIso })
      .eq('id', userId);
    if (ue) throw ue;

    return res.json({ ok: true, plan_id: target, updated: true });
  } catch (e) {
    console.error('[me/sync-registration-plan]', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: e.message });
  }
});

router.post('/redeem-registration-link', async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const code = String(req.body?.code || '').trim();
    if (!code) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing code.' });
    }
    const result = await redeemRegistrationLink(code, user.id);
    if (!result.ok) {
      if (result.error === 'SKIP_AGENCY_USER') {
        return res.status(200).json({
          ok: false,
          error: result.error,
          message: result.message || 'Your plan is set by your agency membership; signup ref was not applied.',
        });
      }
      const status =
        result.error === 'INVALID_CODE' || result.error === 'LINK_EXHAUSTED' || result.error === 'EXPIRED'
          ? 400
          : result.error === 'ALREADY_REDEEMED'
            ? 409
            : 500;
      return res.status(status).json({
        ok: false,
        error: result.error,
        message: result.message,
      });
    }
    return res.json({ ok: true, plan_id: result.plan_id });
  } catch (e) {
    console.error('[me/redeem-registration-link]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

export default router;
