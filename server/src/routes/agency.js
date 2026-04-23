import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { isAgencyOwner } from '../middleware/agencyAuth.js';
import { supabaseAdmin } from '../services/supabase.js';
import { throwIfSupabaseError } from '../lib/supabaseRestError.js';
import { normalizePlanId } from '../data/plans.js';

function frontendBaseUrl() {
  const raw = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173').trim();
  return raw.replace(/\/+$/, '');
}

/** Same shape as agency registration `full_url` — send to customer; they sign in then open this link. */
function agencyTierTokenSetupUrl(rawToken) {
  const base = frontendBaseUrl();
  const token = String(rawToken || '').trim();
  return `${base}/agency-setup?token=${encodeURIComponent(token)}`;
}

/** Opens login first; after auth, user is sent to agency-setup with the same token. */
function agencyTierTokenLoginUrl(rawToken) {
  const base = frontendBaseUrl();
  const token = String(rawToken || '').trim();
  return `${base}/login?tier_token=${encodeURIComponent(token)}`;
}

function parseIsoOrNull(v) {
  if (v === '' || v === undefined || v === null) return null;
  const t = new Date(String(v)).getTime();
  if (Number.isNaN(t)) return 'invalid';
  return new Date(t).toISOString();
}

/** Seat-cap trigger (migration 054) raises these messages; map to HTTP for join flows. */
function agencyMemberSeatCapResponse(err) {
  const msg = `${err?.message ?? ''} ${err?.details ?? ''}`;
  if (msg.includes('AGENCY_FULL')) {
    return {
      status: 409,
      json: { error: 'AGENCY_FULL', message: 'This agency has no open seats.' },
    };
  }
  if (msg.includes('LINK_FULL')) {
    return {
      status: 409,
      json: { error: 'LINK_FULL', message: 'This invite link is full.' },
    };
  }
  return null;
}

async function authEmailForUser(userId) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !data?.user) return '';
    return String(data.user.email || '');
  } catch {
    return '';
  }
}

/** First token of display name for default agency title, e.g. `Agency owner Rishi`. */
async function profileAgencyOwnerFirstName(userId) {
  const { data: p } = await supabaseAdmin
    .from('profiles')
    .select('full_name, first_name, last_name')
    .eq('id', userId)
    .maybeSingle();
  const full = String(p?.full_name ?? '').trim();
  if (full) return full.split(/\s+/)[0];
  const fn = String(p?.first_name ?? '').trim();
  if (fn) return fn;
  const ln = String(p?.last_name ?? '').trim();
  if (ln) return ln;
  const email = await authEmailForUser(userId);
  const local = email.split('@')[0]?.trim();
  if (local) {
    const chunk = local.replace(/[._-]+/g, ' ').trim().split(/\s+/)[0];
    if (chunk) return chunk.slice(0, 1).toUpperCase() + chunk.slice(1).toLowerCase();
  }
  return '';
}

/**
 * When an invite link is deactivated or removed, revoke everyone who joined through that link:
 * deactivate `agency_members` rows and clear `profiles.agency_id` / revert Tier 1 plan to personal.
 */
async function revokeAgencyMembersForRegistrationLink(agencyId, linkId, removedByUserId) {
  if (!supabaseAdmin) return 0;
  const nowIso = new Date().toISOString();
  const personal = normalizePlanId('personal');

  const { data: activeMembers, error: selErr } = await supabaseAdmin
    .from('agency_members')
    .select('member_id')
    .eq('agency_id', agencyId)
    .eq('link_id', linkId)
    .eq('is_active', true);
  throwIfSupabaseError(selErr);
  if (!activeMembers?.length) return 0;

  const { error: memErr } = await supabaseAdmin
    .from('agency_members')
    .update({
      is_active: false,
      removed_at: nowIso,
      removed_by: removedByUserId,
    })
    .eq('agency_id', agencyId)
    .eq('link_id', linkId)
    .eq('is_active', true);
  throwIfSupabaseError(memErr);

  const memberIds = activeMembers.map((r) => r.member_id).filter(Boolean);
  if (!memberIds.length) return 0;

  const { error: pe } = await supabaseAdmin
    .from('profiles')
    .update({
      agency_id: null,
      plan: personal,
      agency_joined_at: null,
      plan_updated_at: nowIso,
      updated_at: nowIso,
    })
    .in('id', memberIds);
  throwIfSupabaseError(pe);

  return memberIds.length;
}

// ═══════════════════════════════════════════════════════════
// Admin (mounted under /api/admin + requireAdminJwt)
// ═══════════════════════════════════════════════════════════
export const agencyAdminRouter = Router();

agencyAdminRouter.post('/agency-tokens', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const adminId = req.adminAuth?.sub;
    const adminDisplay = String(req.adminAuth?.display_name || req.adminAuth?.username || '').trim() || 'Admin';
    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Admin session required.' });
    }
    const agency_type = String(req.body?.agency_type || '').trim();
    if (!['100', '250', '500'].includes(agency_type)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'agency_type must be "100", "250", or "500".',
      });
    }
    const tierCap = Number.parseInt(agency_type, 10);
    const rawSeats = req.body?.max_seats ?? req.body?.max_users ?? req.body?.max_seats_cap ?? tierCap;
    let max_seats = Number.parseInt(String(rawSeats), 10);
    if (!Number.isFinite(max_seats)) {
      max_seats = tierCap;
    }
    max_seats = Math.floor(max_seats);
    if (max_seats < 1 || max_seats > tierCap) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: `max_seats must be between 1 and ${tierCap} for agency_type "${agency_type}".`,
      });
    }
    const rawUses = req.body?.max_link_uses ?? req.body?.max_owner_uses;
    let max_link_uses = null;
    if (rawUses !== undefined && rawUses !== null && String(rawUses).trim() !== '') {
      const n = Math.floor(Number(String(rawUses)));
      if (!Number.isFinite(n) || n < 1 || n > 5000) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'max_link_uses must be empty for unlimited or an integer from 1 to 5000.',
        });
      }
      max_link_uses = n;
    }
    const preset_agency_name =
      req.body?.preset_agency_name != null ? String(req.body.preset_agency_name).trim() || null : null;
    let expires_at = parseIsoOrNull(req.body?.expires_at);
    if (expires_at === 'invalid') {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid expires_at.' });
    }

    const { data, error } = await supabaseAdmin
      .from('agency_tier_tokens')
      .insert({
        agency_type,
        max_seats,
        max_link_uses,
        preset_agency_name,
        created_by_admin_name: adminDisplay,
        expires_at,
        created_by_admin: adminId,
        is_active: true,
      })
      .select('id, token, agency_type, max_seats, max_link_uses, preset_agency_name, expires_at, created_at')
      .single();
    throwIfSupabaseError(error);
    const full_url = agencyTierTokenSetupUrl(data.token);
    const login_invite_url = agencyTierTokenLoginUrl(data.token);
    return res.status(201).json({
      token: data.token,
      full_url,
      login_invite_url,
      id: data.id,
      agency_type: data.agency_type,
      max_seats: data.max_seats,
      max_link_uses: data.max_link_uses,
      preset_agency_name: data.preset_agency_name,
      expires_at: data.expires_at,
      created_at: data.created_at,
    });
  } catch (e) {
    next(e);
  }
});

agencyAdminRouter.get('/agency-tokens', async (_req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const { data: rows, error } = await supabaseAdmin
      .from('agency_tier_tokens')
      .select(
        'id, token, agency_type, max_seats, max_link_uses, preset_agency_name, created_by_admin_name, label, created_by_admin, used_by, used_at, expires_at, is_active, created_at'
      )
      .order('created_at', { ascending: false });
    throwIfSupabaseError(error);
    const list = rows || [];
    const tokenIds = list.map((r) => r.id);
    /** @type {Record<string, { agencyIds: string[], ownerIds: string[], seatsUsed: number, maxCap: number }>} */
    const aggByToken = {};
    if (tokenIds.length) {
      const { data: agencyRows, error: ae } = await supabaseAdmin
        .from('agencies')
        .select('id, token_id, owner_id, seats_used, max_seats')
        .in('token_id', tokenIds);
      throwIfSupabaseError(ae);
      for (const a of agencyRows || []) {
        if (!a?.token_id) continue;
        if (!aggByToken[a.token_id]) {
          aggByToken[a.token_id] = { agencyIds: [], ownerIds: [], seatsUsed: 0, maxCap: 0 };
        }
        const g = aggByToken[a.token_id];
        g.agencyIds.push(a.id);
        if (a.owner_id) g.ownerIds.push(a.owner_id);
        g.seatsUsed += Number(a.seats_used) || 0;
        g.maxCap += Number(a.max_seats) || 0;
      }
    }
    const ownerIdsForProfiles = [
      ...list.map((r) => r.used_by).filter(Boolean),
      ...Object.values(aggByToken).flatMap((g) => g.ownerIds),
    ];
    const usedIds = [...new Set(ownerIdsForProfiles)];
    let usedMap = {};
    if (usedIds.length) {
      const { data: profs, error: pe } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', usedIds);
      throwIfSupabaseError(pe);
      usedMap = Object.fromEntries((profs || []).map((p) => [p.id, p]));
    }
    const tokens = list.map((t) => {
      const agg = aggByToken[t.id];
      const linkMax = t.max_link_uses == null ? null : Number(t.max_link_uses);
      const linkUsed = agg?.agencyIds.length ?? 0;
      const cap = agg?.maxCap ? agg.maxCap : Number(t.max_seats) || 0;
      const seatsUsed = agg?.seatsUsed ?? 0;
      const firstAgencyId = agg?.agencyIds[0] ?? null;
      const ownerId = t.used_by || agg?.ownerIds[0] || null;
      return {
        ...t,
        full_url: agencyTierTokenSetupUrl(t.token),
        login_invite_url: agencyTierTokenLoginUrl(t.token),
        used_by_profile: ownerId ? usedMap[ownerId] || null : null,
        agency_seats_used: seatsUsed,
        agency_max_seats: cap,
        agency_id: firstAgencyId,
        link_activations_used: linkUsed,
        link_activations_max: linkMax,
      };
    });
    return res.json(tokens);
  } catch (e) {
    next(e);
  }
});

/** Hard-delete a tier token row (must be registered before `DELETE /agency-tokens/:id`). */
agencyAdminRouter.delete('/agency-tokens/:id/permanent', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const { id } = req.params;
    const { data: existing, error: fe } = await supabaseAdmin
      .from('agency_tier_tokens')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    throwIfSupabaseError(fe);
    if (!existing) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Token not found.' });
    }
    const { error: eAg } = await supabaseAdmin.from('agencies').update({ token_id: null }).eq('token_id', id);
    throwIfSupabaseError(eAg);
    const { error: eDel } = await supabaseAdmin.from('agency_tier_tokens').delete().eq('id', id);
    throwIfSupabaseError(eDel);
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});

agencyAdminRouter.delete('/agency-tokens/:id', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('agency_tier_tokens')
      .update({ is_active: false })
      .eq('id', id)
      .select('id')
      .maybeSingle();
    throwIfSupabaseError(error);
    if (!data) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Token not found.' });
    }
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});

agencyAdminRouter.get('/agencies', async (_req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const { data: agencies, error } = await supabaseAdmin
      .from('agencies')
      .select('id, owner_id, agency_type, max_seats, seats_used, agency_name, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });
    throwIfSupabaseError(error);
    const ownerIds = [...new Set((agencies || []).map((a) => a.owner_id).filter(Boolean))];
    let owners = {};
    if (ownerIds.length) {
      const { data: profs, error: pe } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url, plan')
        .in('id', ownerIds);
      throwIfSupabaseError(pe);
      owners = Object.fromEntries((profs || []).map((p) => [p.id, p]));
    }
    const out = (agencies || []).map((a) => ({
      ...a,
      owner: owners[a.owner_id] || null,
    }));
    return res.json(out);
  } catch (e) {
    next(e);
  }
});

agencyAdminRouter.get('/agencies/:id', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const { id } = req.params;
    const { data: agency, error } = await supabaseAdmin.from('agencies').select('*').eq('id', id).maybeSingle();
    throwIfSupabaseError(error);
    if (!agency) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Agency not found.' });
    }
    const { data: owner } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url, plan, is_agency_owner, agency_id')
      .eq('id', agency.owner_id)
      .maybeSingle();
    const { data: links } = await supabaseAdmin
      .from('agency_registration_links')
      .select('id, token, assigned_plan, label, max_users, used_count, expires_at, is_active, created_at')
      .eq('agency_id', id);
    const { data: members } = await supabaseAdmin
      .from('agency_members')
      .select('id, member_id, link_id, assigned_plan, joined_at, is_active, removed_at')
      .eq('agency_id', id)
      .order('joined_at', { ascending: false });
    return res.json({
      agency,
      owner: owner || null,
      links: links || [],
      members: members || [],
    });
  } catch (e) {
    next(e);
  }
});

agencyAdminRouter.patch('/agencies/:id', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const { id } = req.params;
    if (typeof req.body?.is_active !== 'boolean') {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Body must include is_active (boolean).' });
    }
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .update({ is_active: req.body.is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    throwIfSupabaseError(error);
    if (!data) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Agency not found.' });
    }
    return res.json({ agency: data });
  } catch (e) {
    next(e);
  }
});

// ═══════════════════════════════════════════════════════════
// Agency user API (/api/agency)
// ═══════════════════════════════════════════════════════════
const router = Router();

/** Public — invite preview for `/join?agency_link=`. */
router.get('/join/preview', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const token = String(req.query.token || '').trim();
    if (!token) {
      return res.status(400).json({
        is_valid: false,
        agency_name: null,
        assigned_plan: null,
        seats_remaining: 0,
        message: 'Missing token.',
      });
    }
    const { data: link, error } = await supabaseAdmin
      .from('agency_registration_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!link) {
      return res.json({
        agency_name: null,
        assigned_plan: null,
        seats_remaining: 0,
        is_valid: false,
        expired: false,
        link_full: false,
        agency_full: false,
      });
    }
    const expired = Boolean(link.expires_at && new Date(link.expires_at).getTime() <= Date.now());
    const linkFull = link.used_count >= link.max_users;
    const { data: agency, error: ae } = await supabaseAdmin
      .from('agencies')
      .select('agency_name, max_seats, seats_used, is_active, owner_id')
      .eq('id', link.agency_id)
      .maybeSingle();
    if (ae) throw ae;
    const agencyFull = Boolean(
      agency && Number(agency.seats_used) >= Number(agency.max_seats)
    );
    const agencyInactive = !agency?.is_active;
    const seatsLink = Math.max(0, Number(link.max_users) - Number(link.used_count || 0));
    const seatsAgency = agency
      ? Math.max(0, Number(agency.max_seats) - Number(agency.seats_used || 0))
      : 0;
    const seats_remaining = Math.min(seatsLink, seatsAgency);
    const is_valid = !expired && !linkFull && !agencyFull && !agencyInactive && Boolean(agency);

    let agencyDisplayName = agency?.agency_name?.trim() || null;
    if (!agencyDisplayName && agency?.owner_id) {
      const ownerFirst = await profileAgencyOwnerFirstName(agency.owner_id);
      if (ownerFirst) agencyDisplayName = `Agency owner ${ownerFirst}`;
    }

    return res.json({
      agency_name: agencyDisplayName,
      assigned_plan: normalizePlanId(link.assigned_plan),
      seats_remaining,
      is_valid,
      expired,
      link_full: linkFull,
      agency_full: agencyFull,
    });
  } catch (e) {
    next(e);
  }
});

/** Public — tier token preview for `/agency-setup?token=`. */
router.get('/setup/preview', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const token = String(req.query.token || '').trim();
    if (!token) {
      return res.status(400).json({
        is_valid: false,
        agency_type: null,
        max_seats: null,
        expired: false,
        already_used: false,
        message: 'Missing token.',
      });
    }
    const { data: tier, error } = await supabaseAdmin
      .from('agency_tier_tokens')
      .select('agency_type, max_seats, max_link_uses, preset_agency_name, expires_at, used_by, is_active, id')
      .eq('token', token)
      .maybeSingle();
    if (error) throw error;
    if (!tier || !tier.is_active) {
      return res.json({
        agency_type: null,
        max_seats: null,
        is_valid: false,
        expired: false,
        already_used: false,
      });
    }
    const { count: activationCount, error: ce } = await supabaseAdmin
      .from('agencies')
      .select('*', { count: 'exact', head: true })
      .eq('token_id', tier.id);
    if (ce) throw ce;
    const used = Number(activationCount) || 0;
    const linkMax = tier.max_link_uses == null ? null : Number(tier.max_link_uses);
    const expired = Boolean(tier.expires_at && new Date(tier.expires_at).getTime() <= Date.now());
    const already_used = linkMax != null && used >= linkMax;
    const is_valid = !expired && !already_used;
    return res.json({
      agency_type: tier.agency_type,
      max_seats: tier.max_seats,
      preset_agency_name: tier.preset_agency_name || null,
      is_valid,
      expired,
      already_used,
      owner_link_used: used,
      owner_link_total: linkMax,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/register-with-token', requireAuth, async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const userId = req.user.id;
    const token = String(req.body?.token || '').trim();
    if (!token) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing token.' });
    }

    const { data: existingOwner } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();
    if (existingOwner) {
      return res.status(409).json({
        error: 'ALREADY_HAS_AGENCY',
        message: 'You already have an agency account.',
      });
    }

    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('is_agency_owner')
      .eq('id', userId)
      .maybeSingle();
    if (prof?.is_agency_owner) {
      return res.status(409).json({
        error: 'ALREADY_HAS_AGENCY',
        message: 'You already have an agency account.',
      });
    }

    const { data: activeMember } = await supabaseAdmin
      .from('agency_members')
      .select('id')
      .eq('member_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    if (activeMember) {
      return res.status(409).json({
        error: 'ALREADY_IN_AGENCY',
        message: 'Leave your current agency before creating a new one.',
      });
    }

    const { data: tier, error: te } = await supabaseAdmin
      .from('agency_tier_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();
    throwIfSupabaseError(te);
    if (!tier) {
      return res.status(404).json({ error: 'TOKEN_NOT_FOUND', message: 'Invalid or inactive token.' });
    }
    if (tier.expires_at && new Date(tier.expires_at).getTime() <= Date.now()) {
      return res.status(410).json({ error: 'TOKEN_EXPIRED', message: 'This agency token has expired.' });
    }
    const { count: actCount, error: cntErr } = await supabaseAdmin
      .from('agencies')
      .select('*', { count: 'exact', head: true })
      .eq('token_id', tier.id);
    throwIfSupabaseError(cntErr);
    const linkMax = tier.max_link_uses == null ? null : Number(tier.max_link_uses);
    const act = Number(actCount) || 0;
    if (linkMax != null && act >= linkMax) {
      return res.status(409).json({
        error: 'TOKEN_EXHAUSTED',
        message: `This agency link has already been used the maximum number of times (${linkMax}).`,
      });
    }

    const ownerFirst = await profileAgencyOwnerFirstName(userId);
    /** Always name the org from the signed-in user who activates (not admin preset on the token). */
    const agency_name = ownerFirst ? `Agency owner ${ownerFirst}` : null;

    const { data: agency, error: ae } = await supabaseAdmin
      .from('agencies')
      .insert({
        owner_id: userId,
        agency_type: tier.agency_type,
        max_seats: tier.max_seats,
        token_id: tier.id,
        is_active: true,
        agency_name,
      })
      .select('id, agency_type, max_seats')
      .single();
    if (ae) {
      if (ae.code === '23505') {
        return res.status(409).json({
          error: 'ALREADY_HAS_AGENCY',
          message: 'You already have an agency account.',
        });
      }
      throwIfSupabaseError(ae);
    }

    const { error: ue } = await supabaseAdmin
      .from('agency_tier_tokens')
      .update({ used_by: userId, used_at: new Date().toISOString() })
      .eq('id', tier.id);
    throwIfSupabaseError(ue);

    const { error: pe } = await supabaseAdmin
      .from('profiles')
      .update({
        is_agency_owner: true,
        agency_id: agency.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    throwIfSupabaseError(pe);

    return res.status(201).json({
      agency_id: agency.id,
      agency_type: agency.agency_type,
      max_seats: agency.max_seats,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/join', requireAuth, async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const userId = req.user.id;
    const link_token = String(req.body?.link_token || '').trim();
    if (!link_token) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing link_token.' });
    }

    const { data: ownerAgency } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();
    if (ownerAgency) {
      return res.status(409).json({
        error: 'ALREADY_IN_AGENCY',
        message: 'Agency owners must join via a different flow.',
      });
    }

    const { data: activeMember } = await supabaseAdmin
      .from('agency_members')
      .select('id, agency_id')
      .eq('member_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    if (activeMember) {
      return res.status(409).json({
        error: 'ALREADY_IN_AGENCY',
        message: 'You already belong to an agency.',
      });
    }

    const { data: link, error: le } = await supabaseAdmin
      .from('agency_registration_links')
      .select('*')
      .eq('token', link_token)
      .eq('is_active', true)
      .maybeSingle();
    throwIfSupabaseError(le);
    if (!link) {
      return res.status(404).json({ error: 'LINK_NOT_FOUND', message: 'Invalid or inactive link.' });
    }
    if (link.expires_at && new Date(link.expires_at).getTime() <= Date.now()) {
      return res.status(410).json({ error: 'LINK_EXPIRED', message: 'This invite link has expired.' });
    }
    if (link.used_count >= link.max_users) {
      return res.status(409).json({ error: 'LINK_FULL', message: 'This invite link is full.' });
    }

    const { data: agencyRow, error: age } = await supabaseAdmin
      .from('agencies')
      .select('id, max_seats, seats_used, agency_name, is_active')
      .eq('id', link.agency_id)
      .maybeSingle();
    throwIfSupabaseError(age);
    if (!agencyRow) {
      return res.status(404).json({ error: 'AGENCY_NOT_FOUND', message: 'Agency not found for this link.' });
    }
    if (!agencyRow?.is_active) {
      return res.status(404).json({ error: 'AGENCY_INACTIVE', message: 'This agency is not active.' });
    }
    if (agencyRow.seats_used >= agencyRow.max_seats) {
      return res.status(409).json({ error: 'AGENCY_FULL', message: 'This agency has no open seats.' });
    }

    const assigned_plan = normalizePlanId(link.assigned_plan);
    const agency_id = link.agency_id;
    const link_id = link.id;

    const { data: existingRow } = await supabaseAdmin
      .from('agency_members')
      .select('id, is_active')
      .eq('agency_id', agency_id)
      .eq('member_id', userId)
      .maybeSingle();

    if (existingRow?.is_active) {
      return res.status(409).json({
        error: 'ALREADY_IN_AGENCY',
        message: 'You already belong to this agency.',
      });
    }

    const nowIso = new Date().toISOString();
    if (existingRow && !existingRow.is_active) {
      const { error: upErr } = await supabaseAdmin
        .from('agency_members')
        .update({
          is_active: true,
          link_id,
          assigned_plan,
          joined_at: nowIso,
          removed_at: null,
          removed_by: null,
        })
        .eq('id', existingRow.id);
      if (upErr) {
        const cap = agencyMemberSeatCapResponse(upErr);
        if (cap) return res.status(cap.status).json(cap.json);
        throwIfSupabaseError(upErr);
      }
    } else {
      const { error: insErr } = await supabaseAdmin.from('agency_members').insert({
        agency_id,
        member_id: userId,
        link_id,
        assigned_plan,
        is_active: true,
        joined_at: nowIso,
      });
      if (insErr) {
        if (insErr.code === '23505') {
          return res.status(409).json({
            error: 'ALREADY_IN_AGENCY',
            message: 'You already belong to this agency.',
          });
        }
        const cap = agencyMemberSeatCapResponse(insErr);
        if (cap) return res.status(cap.status).json(cap.json);
        throwIfSupabaseError(insErr);
      }
    }

    const { error: pErr } = await supabaseAdmin
      .from('profiles')
      .update({
        agency_id,
        plan: assigned_plan,
        agency_joined_at: nowIso,
        plan_updated_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', userId);
    throwIfSupabaseError(pErr);

    return res.status(201).json({
      agency_name: agencyRow.agency_name || null,
      assigned_plan,
      agency_id,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, isAgencyOwner, async (req, res, next) => {
  try {
    const agency = req.agency;
    const { data: ownerProf } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', agency.owner_id)
      .maybeSingle();
    const owner_plan = normalizePlanId(ownerProf?.plan);

    const { data: links, error: le } = await supabaseAdmin
      .from('agency_registration_links')
      .select(
        'id, token, assigned_plan, label, max_users, used_count, expires_at, is_active, created_at'
      )
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });
    throwIfSupabaseError(le);

    const { data: memberRows, error: me } = await supabaseAdmin
      .from('agency_members')
      .select('id, member_id, link_id, assigned_plan, joined_at, is_active, removed_at')
      .eq('agency_id', agency.id)
      .order('joined_at', { ascending: false });
    throwIfSupabaseError(me);

    const linkIds = [...new Set((memberRows || []).map((r) => r.link_id).filter(Boolean))];
    let linkLabelById = {};
    if (linkIds.length) {
      const { data: linkRows, error: le2 } = await supabaseAdmin
        .from('agency_registration_links')
        .select('id, label')
        .in('id', linkIds);
      throwIfSupabaseError(le2);
      linkLabelById = Object.fromEntries((linkRows || []).map((l) => [l.id, l.label]));
    }

    const members = [];
    for (const row of memberRows || []) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', row.member_id)
        .maybeSingle();
      const email = await authEmailForUser(row.member_id);
      const linkLabel = row.link_id ? linkLabelById[row.link_id] ?? null : null;
      members.push({
        member_id: row.member_id,
        full_name: profile?.full_name || null,
        email,
        avatar_url: profile?.avatar_url || null,
        assigned_plan: row.assigned_plan,
        joined_at: row.joined_at,
        is_active: row.is_active,
        link_label: linkLabel,
      });
    }

    return res.json({
      id: agency.id,
      agency_type: agency.agency_type,
      max_seats: agency.max_seats,
      seats_used: agency.seats_used,
      agency_name: agency.agency_name,
      owner_plan,
      is_active: agency.is_active,
      created_at: agency.created_at,
      links: links || [],
      members,
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/me', requireAuth, isAgencyOwner, async (req, res, next) => {
  try {
    const agency = req.agency;
    const agency_name =
      req.body?.agency_name !== undefined ? String(req.body.agency_name).trim() || null : undefined;
    if (agency_name === undefined) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing agency_name.' });
    }
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .update({ agency_name, updated_at: new Date().toISOString() })
      .eq('id', agency.id)
      .select('*')
      .single();
    throwIfSupabaseError(error);
    return res.json({ agency: data });
  } catch (e) {
    next(e);
  }
});

router.post('/links', requireAuth, isAgencyOwner, async (req, res, next) => {
  try {
    const agency = req.agency;
    const assigned_plan = normalizePlanId(req.body?.assigned_plan);
    if (!['personal', 'advanced', 'ultimate'].includes(assigned_plan)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'assigned_plan must be personal, advanced, or ultimate.',
      });
    }
    const label = req.body?.label != null ? String(req.body.label).trim() || null : null;
    let max_users = Number(req.body?.max_users);
    if (!Number.isFinite(max_users) || max_users < 1) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'max_users must be a positive number.',
      });
    }
    max_users = Math.floor(max_users);

    let expires_at = parseIsoOrNull(req.body?.expires_at);
    if (expires_at === 'invalid') {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid expires_at.' });
    }

    const seats_used = Number(agency.seats_used) || 0;
    const max_seats = Number(agency.max_seats) || 0;
    if (!agency.is_active) {
      return res.status(409).json({ error: 'AGENCY_INACTIVE', message: 'Agency is not active.' });
    }
    if (seats_used + max_users > max_seats) {
      return res.status(409).json({
        error: 'INSUFFICIENT_SEATS',
        message: 'Not enough open seats for this link size.',
      });
    }

    const { data: row, error } = await supabaseAdmin
      .from('agency_registration_links')
      .insert({
        agency_id: agency.id,
        assigned_plan,
        label,
        max_users,
        expires_at,
        is_active: true,
      })
      .select('id, token, assigned_plan, label, max_users')
      .single();
    throwIfSupabaseError(error);

    const base = frontendBaseUrl();
    const full_url = `${base}/join?agency_link=${encodeURIComponent(row.token)}`;
    return res.status(201).json({
      id: row.id,
      token: row.token,
      full_url,
      assigned_plan: row.assigned_plan,
      label: row.label,
      max_users: row.max_users,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/links', requireAuth, isAgencyOwner, async (req, res, next) => {
  try {
    const agency = req.agency;
    const { data, error } = await supabaseAdmin
      .from('agency_registration_links')
      .select(
        'id, token, assigned_plan, label, max_users, used_count, expires_at, is_active, created_at'
      )
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });
    throwIfSupabaseError(error);
    return res.json(data || []);
  } catch (e) {
    next(e);
  }
});

router.delete('/links/:id', requireAuth, isAgencyOwner, async (req, res, next) => {
  try {
    const agency = req.agency;
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing link id.' });
    }
    const { data: row, error: fe } = await supabaseAdmin
      .from('agency_registration_links')
      .select('id, is_active')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .maybeSingle();
    throwIfSupabaseError(fe);
    if (!row) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Link not found.' });
    }
    /** First click deactivates the URL; second click deletes the row — both revoke members tied to this link. */
    await revokeAgencyMembersForRegistrationLink(agency.id, id, req.user.id);
    if (row.is_active) {
      const { error: ue } = await supabaseAdmin
        .from('agency_registration_links')
        .update({ is_active: false })
        .eq('id', id)
        .eq('agency_id', agency.id);
      throwIfSupabaseError(ue);
    } else {
      const { error: de } = await supabaseAdmin
        .from('agency_registration_links')
        .delete()
        .eq('id', id)
        .eq('agency_id', agency.id);
      throwIfSupabaseError(de);
    }
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.get('/members', requireAuth, isAgencyOwner, async (req, res, next) => {
  try {
    const agency = req.agency;
    const { data: rows, error } = await supabaseAdmin
      .from('agency_members')
      .select('member_id, link_id, assigned_plan, joined_at, is_active')
      .eq('agency_id', agency.id)
      .order('joined_at', { ascending: false });
    throwIfSupabaseError(error);

    const linkIds = [...new Set((rows || []).map((r) => r.link_id).filter(Boolean))];
    let linkLabelById = {};
    if (linkIds.length) {
      const { data: linkRows, error: le2 } = await supabaseAdmin
        .from('agency_registration_links')
        .select('id, label')
        .in('id', linkIds);
      throwIfSupabaseError(le2);
      linkLabelById = Object.fromEntries((linkRows || []).map((l) => [l.id, l.label]));
    }

    const out = [];
    for (const row of rows || []) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', row.member_id)
        .maybeSingle();
      const email = await authEmailForUser(row.member_id);
      out.push({
        member_id: row.member_id,
        full_name: profile?.full_name || null,
        email,
        avatar_url: profile?.avatar_url || null,
        assigned_plan: row.assigned_plan,
        joined_at: row.joined_at,
        is_active: row.is_active,
        link_label: row.link_id ? linkLabelById[row.link_id] ?? null : null,
      });
    }
    return res.json(out);
  } catch (e) {
    next(e);
  }
});

router.patch('/members/:memberId', requireAuth, isAgencyOwner, async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const agency = req.agency;
    const memberId = String(req.params.memberId || '').trim();
    if (!memberId) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing member id.' });
    }
    if (memberId === agency.owner_id) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Cannot change membership for the agency owner.',
      });
    }
    if (typeof req.body?.is_active !== 'boolean') {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Body must include is_active (boolean).' });
    }
    const wantActive = req.body.is_active;

    const { data: row, error: fe } = await supabaseAdmin
      .from('agency_members')
      .select('id, is_active, assigned_plan, joined_at')
      .eq('agency_id', agency.id)
      .eq('member_id', memberId)
      .maybeSingle();
    throwIfSupabaseError(fe);
    if (!row) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Member not found in this agency.' });
    }

    const nowIso = new Date().toISOString();

    if (!wantActive) {
      if (!row.is_active) {
        return res.status(409).json({ error: 'ALREADY_INACTIVE', message: 'Member is already inactive.' });
      }
      const { error: ue } = await supabaseAdmin
        .from('agency_members')
        .update({
          is_active: false,
          removed_at: nowIso,
          removed_by: req.user.id,
        })
        .eq('id', row.id);
      throwIfSupabaseError(ue);

      const personal = normalizePlanId('personal');
      const { error: pe } = await supabaseAdmin
        .from('profiles')
        .update({
          agency_id: null,
          plan: personal,
          agency_joined_at: null,
          plan_updated_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', memberId);
      throwIfSupabaseError(pe);
      return res.json({ member_id: memberId, is_active: false });
    }

    if (row.is_active) {
      return res.json({ member_id: memberId, is_active: true });
    }

    const { data: agencyRow, error: age } = await supabaseAdmin
      .from('agencies')
      .select('id, max_seats, seats_used, is_active')
      .eq('id', agency.id)
      .maybeSingle();
    throwIfSupabaseError(age);
    if (!agencyRow?.is_active) {
      return res.status(409).json({ error: 'AGENCY_INACTIVE', message: 'This agency is not active.' });
    }
    if (Number(agencyRow.seats_used) >= Number(agencyRow.max_seats)) {
      return res.status(409).json({ error: 'AGENCY_FULL', message: 'This agency has no open seats.' });
    }

    const assigned_plan = normalizePlanId(row.assigned_plan);
    const profileJoinedAt = row.joined_at || nowIso;
    const { error: upMem } = await supabaseAdmin
      .from('agency_members')
      .update({
        is_active: true,
        removed_at: null,
        removed_by: null,
      })
      .eq('id', row.id);
    if (upMem) {
      const cap = agencyMemberSeatCapResponse(upMem);
      if (cap) return res.status(cap.status).json(cap.json);
      throwIfSupabaseError(upMem);
    }

    const { error: pe } = await supabaseAdmin
      .from('profiles')
      .update({
        agency_id: agency.id,
        plan: assigned_plan,
        agency_joined_at: profileJoinedAt,
        plan_updated_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', memberId);
    throwIfSupabaseError(pe);

    return res.json({ member_id: memberId, is_active: true });
  } catch (e) {
    next(e);
  }
});

router.post('/members/:memberId/password', requireAuth, isAgencyOwner, async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
    }
    const agency = req.agency;
    const memberId = String(req.params.memberId || '').trim();
    const password = String(req.body?.password || '');
    if (!memberId) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing member id.' });
    }
    if (memberId === agency.owner_id) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Use account settings to change your own password.',
      });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Password must be at least 8 characters.' });
    }

    const { data: row, error: fe } = await supabaseAdmin
      .from('agency_members')
      .select('id')
      .eq('agency_id', agency.id)
      .eq('member_id', memberId)
      .maybeSingle();
    throwIfSupabaseError(fe);
    if (!row) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Member not found in this agency.' });
    }

    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(memberId, { password });
    if (authErr) {
      console.error('[agency/members/password]', authErr);
      return res.status(400).json({
        error: 'AUTH_ERROR',
        message: authErr.message || 'Could not update password.',
      });
    }
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.delete('/members/:memberId', requireAuth, isAgencyOwner, async (req, res, next) => {
  try {
    const agency = req.agency;
    const memberId = String(req.params.memberId || '').trim();
    if (!memberId) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing member id.' });
    }
    if (memberId === agency.owner_id) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Cannot remove the agency owner as a member.',
      });
    }

    const { data: row, error: fe } = await supabaseAdmin
      .from('agency_members')
      .select('id, is_active')
      .eq('agency_id', agency.id)
      .eq('member_id', memberId)
      .maybeSingle();
    throwIfSupabaseError(fe);
    if (!row) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Member not found in this agency.' });
    }
    if (!row.is_active) {
      return res.status(409).json({ error: 'ALREADY_REMOVED', message: 'Member is already inactive.' });
    }

    const nowIso = new Date().toISOString();
    const { error: ue } = await supabaseAdmin
      .from('agency_members')
      .update({
        is_active: false,
        removed_at: nowIso,
        removed_by: req.user.id,
      })
      .eq('id', row.id);
    throwIfSupabaseError(ue);

    const personal = normalizePlanId('personal');
    const { error: pe } = await supabaseAdmin
      .from('profiles')
      .update({
        agency_id: null,
        plan: personal,
        agency_joined_at: null,
        plan_updated_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', memberId);
    throwIfSupabaseError(pe);

    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
