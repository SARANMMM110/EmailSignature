import { Router } from 'express';
import { redeemRegistrationLink } from '../services/registrationLinkRedeem.js';

const router = Router();

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
