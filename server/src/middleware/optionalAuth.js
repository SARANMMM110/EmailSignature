import { supabaseAdmin } from '../services/supabase.js';
import { ensureUserProfile } from '../services/ensureProfile.js';

/**
 * Attaches `req.user` when a valid Bearer token is present; otherwise continues without user.
 */
export async function optionalAuth(req, _res, next) {
  try {
    if (!supabaseAdmin) return next();
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();
    const token = authHeader.slice(7).trim();
    if (!token) return next();
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return next();
    try {
      await ensureUserProfile(user);
    } catch {
      return next();
    }
    req.user = user;
    req.accessToken = token;
  } catch {
    /* ignore */
  }
  next();
}
