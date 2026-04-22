import { supabaseAdmin } from '../services/supabase.js';

/**
 * Requires `requireAuth` first — loads profile and agency for the authenticated owner.
 */
export async function isAgencyOwner(req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        error: 'MISCONFIGURED',
        message: 'Server missing Supabase configuration.',
      });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing user.' });
    }

    const { data: profile, error: pe } = await supabaseAdmin
      .from('profiles')
      .select('is_agency_owner, agency_id')
      .eq('id', userId)
      .maybeSingle();
    if (pe) {
      console.error('[isAgencyOwner] profile', pe);
      return res.status(500).json({ error: 'SERVER_ERROR', message: pe.message });
    }
    if (!profile?.is_agency_owner) {
      return res.status(403).json({
        error: 'NOT_AGENCY_OWNER',
        message: 'You must have an agency account to access this resource.',
      });
    }

    const { data: agency, error: ae } = await supabaseAdmin
      .from('agencies')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();
    if (ae) {
      console.error('[isAgencyOwner] agency', ae);
      return res.status(500).json({ error: 'SERVER_ERROR', message: ae.message });
    }
    if (!agency) {
      return res.status(403).json({
        error: 'NOT_AGENCY_OWNER',
        message: 'No agency record found for this account.',
      });
    }

    req.agency = agency;
    next();
  } catch (e) {
    console.error('[isAgencyOwner]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message || 'Server error' });
  }
}

/**
 * Requires `requireAuth` first — platform admin flag on `profiles.is_admin`.
 * (Admin panel JWT routes use `requireAdminJwt` instead.)
 */
export async function isProfileAdmin(req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        error: 'MISCONFIGURED',
        message: 'Server missing Supabase configuration.',
      });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing user.' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('[isProfileAdmin]', error);
      return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
    if (!profile?.is_admin) {
      return res.status(403).json({
        error: 'ADMIN_REQUIRED',
        message: 'Administrator access required.',
      });
    }
    next();
  } catch (e) {
    console.error('[isProfileAdmin]', e);
    return res.status(500).json({ error: 'SERVER_ERROR', message: e.message || 'Server error' });
  }
}
