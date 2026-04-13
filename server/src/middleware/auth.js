import { supabaseAdmin } from '../services/supabase.js';
import { ensureUserProfile } from '../services/ensureProfile.js';

/**
 * Verifies `Authorization: Bearer <access_token>` with Supabase Auth.
 * Attaches `req.user` and `req.accessToken` on success.
 */
export async function requireAuth(req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        error: 'MISCONFIGURED',
        message: 'Server missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token', message: 'Missing Bearer token' });
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ error: 'No authorization token', message: 'Empty token' });
    }
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token', message: 'Session is not valid' });
    }
    try {
      await ensureUserProfile(user);
    } catch (e) {
      console.error('[auth] ensureUserProfile', e);
      return res.status(503).json({
        error: 'PROFILE_SYNC_FAILED',
        message: 'Could not ensure user profile row. Check database or try again.',
      });
    }
    req.user = user;
    req.accessToken = token;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized', message: e.message || 'Unauthorized' });
  }
}
