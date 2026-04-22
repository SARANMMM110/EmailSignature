import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCopy, FiLogOut, FiSettings, FiTrash2 } from 'react-icons/fi';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { useToast } from '../hooks/useToast.js';
import { agencyAPI } from '../lib/api.js';
import { PLANS, normalizePlanId } from '../data/plans.js';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthStore } from '../store/authStore.js';
import { displayAgencyTitle } from '../lib/agencyDisplay.js';

const ACCENT = '#7c3aed';

function IconBuilding({ className = 'h-8 w-8' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function ChevronRight({ className = 'h-4 w-4 text-slate-400' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function joinUrl(token) {
  if (typeof window === 'undefined') return '';
  const base = window.location.origin.replace(/\/+$/, '');
  return `${base}/join?agency_link=${encodeURIComponent(token)}`;
}

/** `datetime-local` value (user's wall time) → ISO UTC for the API. */
function localDatetimeToIso(value) {
  const s = String(value || '').trim();
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  if ([y, mo, d, h, mi].some((n) => Number.isNaN(n))) return '';
  const dt = new Date(y, mo - 1, d, h, mi, 0, 0);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString();
}

function formatJoined(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function memberInitials(name, email) {
  const n = String(name || '').trim();
  if (n && n !== '—') {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  const e = String(email || '').trim();
  if (e) return e.slice(0, 2).toUpperCase();
  return '?';
}

const cardClass =
  'rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40 ring-1 ring-slate-900/[0.02]';

export function AgencyDashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const { logout } = useAuth();
  const { toast, showToast, dismiss } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createPlan, setCreatePlan] = useState('personal');
  const [createLabel, setCreateLabel] = useState('');
  const [createMaxUsers, setCreateMaxUsers] = useState(10);
  const [createExpiresLocal, setCreateExpiresLocal] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { data: body } = await agencyAPI.getMyAgency();
      setData(body);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load agency.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!createOpen) return;
    setCreatePlan('personal');
    setCreateLabel('');
    setCreateMaxUsers(10);
    setCreateExpiresLocal('');
  }, [createOpen]);

  const activeMembers = useMemo(
    () => (data?.members || []).filter((m) => m.is_active !== false),
    [data?.members]
  );
  const memberCount = activeMembers.length;
  const activeLinks = useMemo(
    () => (data?.links || []).filter((l) => l.is_active !== false),
    [data?.links]
  );
  const activeLinkCount = activeLinks.length;
  const maxSeats = Number(data?.max_seats) || 0;
  const seatsUsed = Number(data?.seats_used) || 0;
  const usagePct = maxSeats > 0 ? Math.min(100, Math.round((seatsUsed / maxSeats) * 100)) : 0;

  const openEditName = () => {
    const stored = String(data?.agency_name || '').trim();
    setNameDraft(stored || displayAgencyTitle(data, profile));
    setEditNameOpen(true);
  };

  const saveAgencyName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await agencyAPI.updateAgency({ agency_name: nameDraft.trim() || null });
      showToast('Agency name updated', 'success');
      setEditNameOpen(false);
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Could not save', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const submitCreateLink = async (e) => {
    e.preventDefault();
    const expiresIso = localDatetimeToIso(createExpiresLocal);
    if (String(createExpiresLocal || '').trim() && !expiresIso) {
      showToast('Please pick a valid expiration date and time.', 'error');
      return;
    }
    setCreating(true);
    try {
      const body = {
        assigned_plan: createPlan,
        label: createLabel.trim() || null,
        max_users: Math.max(1, Math.floor(Number(createMaxUsers) || 1)),
        expires_at: expiresIso || undefined,
      };
      const { data: created } = await agencyAPI.createLink(body);
      const url = created?.full_url || joinUrl(created?.token);
      setCreateOpen(false);
      setCreateLabel('');
      setCreateMaxUsers(10);
      setCreateExpiresLocal('');
      setCreatePlan('personal');
      await load();
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link created — invite URL copied to clipboard', 'success');
      } catch {
        showToast('Link created — copy the URL from the list below', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Could not create link', 'error');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (token) => {
    try {
      await navigator.clipboard.writeText(joinUrl(token));
      showToast('Link copied', 'success');
    } catch {
      showToast('Could not copy', 'error');
    }
  };

  const removeOrDeactivateLink = async (link) => {
    const id = link?.id != null ? String(link.id).trim() : '';
    if (!id) {
      showToast('Invalid link — refresh the page and try again.', 'error');
      return;
    }
    const isLive = link.is_active !== false;
    const msg = isLive
      ? 'Deactivate this registration link? New sign-ups will not be able to use it.'
      : 'Remove this inactive link from your list? This cannot be undone.';
    if (!window.confirm(msg)) return;
    try {
      await agencyAPI.deactivateLink(id);
      showToast(isLive ? 'Link deactivated' : 'Link removed', 'success');
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed', 'error');
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm('Remove this member? Their plan will revert to Personal.')) return;
    try {
      await agencyAPI.removeMember(memberId);
      showToast('Member removed', 'success');
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Remove failed', 'error');
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full bg-slate-100">
      <Sidebar />

      <div className="app-canvas relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/50 text-slate-900">
        <header className="shrink-0 border-b border-slate-200/90 bg-white/90 px-6 py-3.5 shadow-sm shadow-slate-200/30 backdrop-blur-md md:px-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-500">
              <Link to="/dashboard" className="transition hover:text-blue-600">
                Signatures
              </Link>
              <ChevronRight />
              <span className="font-semibold text-slate-900">Agency</span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {!loading && data?.agency_type ? (
                <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white ring-1 ring-slate-900/10">
                  Agency {data.agency_type}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <FiLogOut className="h-4 w-4 shrink-0" aria-hidden />
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 md:px-10 md:py-10">
          {error ? (
            <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="flex items-center gap-3 text-slate-600">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm font-medium">Loading agency…</span>
            </div>
          ) : data ? (
            <>
              <div
                className={`${cardClass} overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/40 p-6 md:p-8`}
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25">
                      <IconBuilding className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/80">Agency owner</p>
                      <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                        {displayAgencyTitle(data, profile)}
                      </h1>
                      {data.agency_type ? (
                        <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-200/80">
                          Agency {data.agency_type}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openEditName}
                    className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-800"
                    title="Edit agency name"
                  >
                    <FiSettings className="h-4 w-4" aria-hidden />
                    Settings
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    key: 'mem',
                    value: `${memberCount}/${maxSeats}`,
                    label: 'Members',
                    valueClass: 'text-slate-900',
                  },
                  {
                    key: 'tier',
                    value: PLANS[normalizePlanId(data.owner_plan || profile?.plan)]?.name || PLANS.personal.name,
                    label: 'Your account plan',
                    valueClass: 'text-violet-600',
                  },
                  {
                    key: 'links',
                    value: activeLinkCount,
                    label: 'Active links',
                    valueClass: 'text-slate-900',
                  },
                  {
                    key: 'st',
                    value: data.is_active !== false ? 'Active' : 'Inactive',
                    label: 'Status',
                    valueClass: data.is_active !== false ? 'text-emerald-600' : 'text-slate-400',
                  },
                ].map((card) => (
                  <div key={card.key} className={`${cardClass} px-5 py-5 transition hover:shadow-md`}>
                    <p className={`text-2xl font-extrabold tabular-nums md:text-3xl ${card.valueClass}`}>{card.value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className={`${cardClass} mt-8 p-4`}>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/90">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-500"
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-xs font-medium text-slate-500">
                  {seatsUsed} / {maxSeats} seats used
                </p>
              </div>

              <section className="mt-12">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Member invite links</h2>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
                      Use <strong className="font-semibold text-slate-800">Generate invite link</strong> to choose a
                      Tier&nbsp;1 plan (Personal, Advanced, or Ultimate) for that invite. Each URL is unique and only
                      applies the plan you pick when you generate it — copy invite URLs from the table below.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md shadow-blue-600/25 hover:brightness-105"
                      onClick={() => setCreateOpen(true)}
                    >
                      Generate invite link
                    </Button>
                  </div>
                </div>

                <div className={`${cardClass} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3 pl-5">Tier</th>
                          <th className="px-4 py-3">Link</th>
                          <th className="px-4 py-3">Uses</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 pr-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(data.links || []).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-14 text-center text-sm font-medium text-slate-500">
                              No invite links yet — use <strong className="text-slate-700">Generate invite link</strong>{' '}
                              above to pick a plan and create your first URL.
                            </td>
                          </tr>
                        ) : (
                          (data.links || []).map((link) => {
                            const pid = normalizePlanId(link.assigned_plan);
                            const planMeta = PLANS[pid] || PLANS.personal;
                            const active = link.is_active !== false;
                            const url = joinUrl(link.token);
                            return (
                              <tr key={link.id || link.token} className="text-slate-800 transition hover:bg-slate-50/80">
                                <td className="px-4 py-3.5 pl-5 align-middle">
                                  <span
                                    className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm"
                                    style={{ background: planMeta.color || ACCENT }}
                                  >
                                    {planMeta.name}
                                  </span>
                                </td>
                                <td className="max-w-[min(52vw,420px)] px-4 py-3.5 align-middle">
                                  <code
                                    className="block truncate font-mono text-[11px] text-slate-600"
                                    title={url}
                                  >
                                    {url}
                                  </code>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3.5 align-middle font-semibold tabular-nums text-slate-700">
                                  {link.used_count}
                                  {link.max_users != null ? ` / ${link.max_users}` : ''}
                                </td>
                                <td className="px-4 py-3.5 align-middle">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                      active
                                        ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80'
                                        : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                    }`}
                                  >
                                    {active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 pr-5 text-right align-middle">
                                  <div className="inline-flex gap-1.5">
                                    <button
                                      type="button"
                                      title="Copy invite URL"
                                      onClick={() => copyLink(link.token)}
                                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                      <FiCopy className="h-4 w-4" aria-hidden />
                                    </button>
                                    <button
                                      type="button"
                                      title={active ? 'Deactivate link' : 'Remove link from list'}
                                      onClick={() => void removeOrDeactivateLink(link)}
                                      className="rounded-lg border border-slate-200 bg-white p-2 text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50"
                                    >
                                      <FiTrash2 className="h-4 w-4" aria-hidden />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="mt-14">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Agency members</h2>
                <p className="mt-1 text-sm text-slate-600">People who joined through your invite links.</p>
                <div className={`${cardClass} mt-4 overflow-hidden`}>
                  {activeMembers.length === 0 ? (
                    <div className="flex flex-col items-center bg-slate-50/30 px-6 py-16 text-center">
                      <div className="max-w-md rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-10 shadow-sm">
                        <p className="text-sm font-semibold text-slate-800">No members yet</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                          Share an invite link from above to add members to your agency.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3 pl-5">Member</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Joined</th>
                            <th className="px-4 py-3 pr-5 text-right" aria-label="Actions" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {activeMembers.map((m) => {
                            const pid = normalizePlanId(m.assigned_plan);
                            const planMeta = PLANS[pid] || PLANS.personal;
                            return (
                              <tr key={m.member_id} className="text-slate-800 transition hover:bg-slate-50/80">
                                <td className="px-4 py-3.5 pl-5">
                                  <div className="flex items-center gap-3">
                                    {m.avatar_url ? (
                                      <img
                                        src={m.avatar_url}
                                        alt=""
                                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                                      />
                                    ) : (
                                      <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-white"
                                        style={{
                                          background: `linear-gradient(135deg, ${planMeta.color || ACCENT}, #4338ca)`,
                                        }}
                                      >
                                        {memberInitials(m.full_name, m.email)}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-semibold text-slate-900">{m.full_name || '—'}</p>
                                      {m.link_label ? (
                                        <p className="text-[11px] text-slate-500">via {m.link_label}</p>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>
                                <td className="max-w-[200px] truncate px-4 py-3.5 text-slate-600">{m.email || '—'}</td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm"
                                    style={{ background: planMeta.color || ACCENT }}
                                  >
                                    {planMeta.name}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-slate-600">{formatJoined(m.joined_at)}</td>
                                <td className="px-4 py-3.5 pr-5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => void removeMember(m.member_id)}
                                    className="rounded-lg border border-transparent px-2 py-1 text-sm font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                    aria-label="Remove member"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              <p className="mt-12">
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  ← Back to signatures
                </Link>
              </p>
            </>
          ) : null}
        </div>
      </div>

      <Modal
        open={editNameOpen}
        onClose={() => !savingName && setEditNameOpen(false)}
        title="Edit agency name"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" disabled={savingName} onClick={() => setEditNameOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="agency-name-form" disabled={savingName}>
              {savingName ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="agency-name-form" onSubmit={saveAgencyName} className="space-y-4">
          <Input
            label="Agency name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="e.g. Acme Digital"
            autoFocus
          />
        </form>
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        title="Generate member invite link"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" disabled={creating} onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="agency-create-link-form" disabled={creating}>
              {creating ? 'Creating…' : 'Generate link'}
            </Button>
          </div>
        }
      >
        <form id="agency-create-link-form" onSubmit={submitCreateLink} className="space-y-4">
          <p className="text-sm leading-relaxed text-slate-600">
            Choose the SignatureBuilder tier for people who join through this URL. You can create multiple links with
            different plans or seat limits.
          </p>
          <div>
            <label
              htmlFor="agency-link-plan"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
            >
              Plan for this invite
            </label>
            <select
              id="agency-link-plan"
              value={createPlan}
              onChange={(e) => setCreatePlan(e.target.value)}
              className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="personal">Personal</option>
              <option value="advanced">Advanced</option>
              <option value="ultimate">Ultimate</option>
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              Team members who join through this link receive this Tier 1 plan.
            </p>
          </div>
          <Input
            label="Label (optional)"
            value={createLabel}
            onChange={(e) => setCreateLabel(e.target.value)}
            placeholder='e.g. "Gold Team"'
          />
          <Input
            label="Max uses"
            type="number"
            min={1}
            value={createMaxUsers}
            onChange={(e) => setCreateMaxUsers(e.target.value)}
          />
          <div>
            <label
              htmlFor="agency-link-expires"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
            >
              Expires (optional)
            </label>
            <input
              id="agency-link-expires"
              type="datetime-local"
              step={60}
              value={createExpiresLocal}
              onChange={(e) => setCreateExpiresLocal(e.target.value)}
              className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Your local date and time. Leave empty for no expiration. The server stores it as UTC (ISO).
            </p>
          </div>
        </form>
      </Modal>

      {toast ? <Toast message={toast.message} type={toast.type} onDismiss={dismiss} duration={3200} /> : null}
    </div>
  );
}
