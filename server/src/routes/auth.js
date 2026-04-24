import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';

const router = Router();

/** Health check for auth service wiring; clients use Supabase directly for login. */
router.get('/session-hint', (req, res) => {
  res.json({
    ok: true,
    hint: 'Use Supabase Auth on the client; send Bearer access_token with API requests.',
  });
});

/**
 * Public email sign-up without confirmation emails: creates a confirmed auth user via
 * the service role, then the client signs in with `signInWithPassword`.
 */
router.post('/register-email', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        error: 'MISCONFIGURED',
        message: 'Server is not configured for sign-up.',
      });
    }
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const full_name = String(req.body?.full_name ?? req.body?.fullName ?? '').trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Valid email is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Password must be at least 6 characters.' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: full_name ? { full_name } : {},
    });

    if (error) {
      const msg = String(error.message || '');
      if (/already|registered|exists/i.test(msg) || error.status === 422) {
        return res.status(409).json({
          error: 'DUPLICATE',
          message: 'An account with this email already exists.',
        });
      }
      console.error('[auth/register-email]', error);
      return res.status(400).json({
        error: 'AUTH_ERROR',
        message: msg || 'Could not create account.',
      });
    }
    if (!data?.user?.id) {
      return res.status(500).json({ error: 'SERVER_ERROR', message: 'User id missing after create.' });
    }

    return res.status(201).json({ ok: true, user_id: data.user.id });
  } catch (e) {
    console.error('[auth/register-email]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
  }
});

export default router;
