import { Router } from 'express';
import { v5 as uuidv5 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { isAgencyOwner } from '../middleware/agencyAuth.js';
import { supabaseAdmin } from '../services/supabase.js';
import { throwIfSupabaseError } from '../lib/supabaseRestError.js';
import { normalizePlanId } from '../data/plans.js';

/** Stable UUID for rows created via admin JWT (no Supabase user id on `req.user`). */
const ADMIN_JWT_ACTOR_UUID = uuidv5(
  'email-signature-builder:admin-jwt-panel',
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
);

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

function parseIsoOrNull(v) {
  if (v === '' || v === undefined || v === null) return null;
  const t = new Date(String(v)).getTime();
  if (Number.isNaN(t)) return 'invalid';
  return new Date(t).toISOString();
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

// ═══════════════════════════════════════════════════════════
// Admin (mounted under /api/admin + requireAdminJwt)
// ═══════════════════════════════════════════════════════════
export const agencyAdminRouter = Router();

agencyAdminRouter.post('/agency-tokens', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'MISCONFIGURED', message: 'Supabase not configured.' });
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
    let expires_at = parseIsoOrNull(req.body?.expires_at);
    if (expires_at === 'invalid') {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid expires_at.' });
    }

    const { data, error } = await supabaseAdmin
      .from('agency_tier_tokens')
      .insert({
        agency_type,
        max_seats,
        expires_at,
        created_by_admin: ADMIN_JWT_ACTOR_UUID,
        is_active: true,
      })
      .select('id, token, agency_type, max_seats, expires_at, created_at')
      .single();
    throwIfSupabaseError(error);
    const full_url = agencyTierTokenSetupUrl(data.token);
    return res.status(201).json({
      token: data.token,
      full_url,
      id: data.id,
      agency_type: data.agency_type,
      max_seats: data.max_seats,
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
        'id, token, agency_type, max_seats, label, created_by_admin, used_by, used_at, expires_at, is_active, created_at'
      )
      .order('created_at', { ascending: false });
    throwIfSupabaseError(error);
    const list = rows || [];
    const usedIds = [...new Set(list.map((r) => r.used_by).filter(Boolean))];
    let usedMap = {};
    if (usedIds.length) {
      const { data: profs, error: pe } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', usedIds);
      throwIfSupabaseError(pe);
      usedMap = Object.fromEntries((profs || []).map((p) => [p.id, p]));
    }
    const tokens = list.map((t) => ({
      ...t,
      full_url: agencyTierTokenSetupUrl(t.token),
      used_by_profile: t.used_by ? usedMap[t.used_by] || null : null,
    }));
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
      .select('agency_type, max_seats, expires_at, used_by, is_active')
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
    const expired = Boolean(tier.expires_at && new Date(tier.expires_at).getTime() <= Date.now());
    const already_used = Boolean(tier.used_by);
    const is_valid = !expired && !already_used;
    return res.json({
      agency_type: tier.agency_type,
      max_seats: tier.max_seats,
      is_valid,
      expired,
      already_used,
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
    if (tier.used_by) {
      return res.status(409).json({ error: 'TOKEN_ALREADY_USED', message: 'This token has already been used.' });
    }

    const ownerFirst = await profileAgencyOwnerFirstName(userId);
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
      throwIfSupabaseError(upErr);
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
