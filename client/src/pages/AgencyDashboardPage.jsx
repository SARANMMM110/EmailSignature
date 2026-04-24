import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCopy, FiKey, FiLogOut, FiSettings, FiTrash2, FiUserPlus } from 'react-icons/fi';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { useToast } from '../hooks/useToast.js';
import { agencyAPI } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthStore } from '../store/authStore.js';
import { displayAgencyTitle } from '../lib/agencyDisplay.js';
import { PLANS, PLAN_IDS } from '../data/plans.js';

const ACCENT = '#7c3aed';

/** Member invite links always assign this Tier 1 plan (Silver). */
const AGENCY_MEMBER_INVITE_PLAN = PLAN_IDS.ADVANCED;

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
  const [createLabel, setCreateLabel] = useState('');
  const [createMaxUsers, setCreateMaxUsers] = useState(10);
  const [createExpiresLocal, setCreateExpiresLocal] = useState('');
  const [creating, setCreating] = useState(false);

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberUsername, setAddMemberUsername] = useState('');
  const [addMemberPassword, setAddMemberPassword] = useState('');
  const [addMemberSubmitting, setAddMemberSubmitting] = useState(false);
  const [addMemberFormError, setAddMemberFormError] = useState('');

  const [passwordMember, setPasswordMember] = useState(null);
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [confirmMemberPassword, setConfirmMemberPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFormError, setPasswordFormError] = useState('');

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
    setCreateLabel('');
    setCreateMaxUsers(10);
    setCreateExpiresLocal('');
  }, [createOpen]);

  useEffect(() => {
    if (!addMemberOpen) return;
    setAddMemberEmail('');
    setAddMemberUsername('');
    setAddMemberPassword('');
    setAddMemberFormError('');
  }, [addMemberOpen]);

  const membersList = useMemo(() => data?.members || [], [data?.members]);
  const activeMemberCount = useMemo(
    () => membersList.filter((m) => m.is_active !== false).length,
    [membersList]
  );
  const maxSeats = Number(data?.max_seats) || 0;

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
        assigned_plan: AGENCY_MEMBER_INVITE_PLAN,
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

  const submitAddMember = async (e) => {
    e.preventDefault();
    setAddMemberFormError('');
    setAddMemberSubmitting(true);
    try {
      await agencyAPI.createMember({
        email: addMemberEmail.trim(),
        username: addMemberUsername.trim(),
        password: addMemberPassword,
      });
      setAddMemberOpen(false);
      showToast(`Member added with ${PLANS.advanced.name} plan`, 'success');
      await load();
    } catch (err) {
      setAddMemberFormError(err.response?.data?.message || err.message || 'Could not add member.');
    } finally {
      setAddMemberSubmitting(false);
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
      ? `Deactivate this registration link? New sign-ups cannot use it, and anyone who joined through this link will lose agency access and their plan will revert to ${PLANS.personal.name}.`
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

  const setMemberActive = async (memberId, nextActive) => {
    if (!nextActive) {
      if (
        !window.confirm(
          `Deactivate this member? They lose agency access and their plan reverts to ${PLANS.personal.name}. You can turn them active again if you have an open seat.`
        )
      ) {
        return;
      }
    } else if (!window.confirm('Reactivate this member? They regain agency access and their invite plan tier.')) {
      return;
    }
    try {
      await agencyAPI.patchMember(memberId, { is_active: nextActive });
      showToast(nextActive ? 'Member activated' : 'Member deactivated', 'success');
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Update failed', 'error');
    }
  };

  const openPasswordModal = (m) => {
    setPasswordFormError('');
    setNewMemberPassword('');
    setConfirmMemberPassword('');
    setPasswordMember(m);
  };

  const submitMemberPassword = async (e) => {
    e.preventDefault();
    setPasswordFormError('');
    if (newMemberPassword.length < 8) {
      setPasswordFormError('Password must be at least 8 characters.');
      return;
    }
    if (newMemberPassword !== confirmMemberPassword) {
      setPasswordFormError('Passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      await agencyAPI.setMemberPassword(passwordMember.member_id, newMemberPassword);
      showToast('Password updated', 'success');
      setPasswordMember(null);
    } catch (err) {
      setPasswordFormError(err.response?.data?.message || err.message || 'Could not update password.');
    } finally {
      setPasswordSaving(false);
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

              <div className="mt-8 grid gap-4 sm:max-w-md">
                <div className={`${cardClass} px-5 py-5 transition hover:shadow-md`}>
                  <p className="text-2xl font-extrabold tabular-nums text-slate-900 md:text-3xl">
                    {activeMemberCount}/{maxSeats}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">Active members</p>
                </div>
              </div>

              <section className="mt-12">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Member invite links</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="inline-flex items-center gap-2 font-semibold"
                      onClick={() => setAddMemberOpen(true)}
                    >
                      <FiUserPlus className="h-4 w-4 shrink-0" aria-hidden />
                      Add user
                    </Button>
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
                          <th className="px-4 py-3 pl-5">Link</th>
                          <th className="px-4 py-3">Uses</th>
                          <th className="px-4 py-3 pr-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(data.links || []).length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-14 text-center text-sm font-medium text-slate-500">
                              No invite links yet — use <strong className="text-slate-700">Generate invite link</strong>{' '}
                              above to create your first join URL.
                            </td>
                          </tr>
                        ) : (
                          (data.links || []).map((link) => {
                            const active = link.is_active !== false;
                            const url = joinUrl(link.token);
                            return (
                              <tr key={link.id || link.token} className="text-slate-800 transition hover:bg-slate-50/80">
                                <td className="max-w-[min(52vw,420px)] px-4 py-3.5 pl-5 align-middle">
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
                <p className="mt-1 text-sm text-slate-600">
                  People who joined through your invite links, or accounts you added with <strong className="font-semibold text-slate-800">Add user</strong>.
                </p>
                <div className={`${cardClass} mt-4 overflow-hidden`}>
                  {membersList.length === 0 ? (
                    <div className="flex flex-col items-center bg-slate-50/30 px-6 py-16 text-center">
                      <div className="max-w-md rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-10 shadow-sm">
                        <p className="text-sm font-semibold text-slate-800">No members yet</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                          Share an invite link from above, or use <strong className="text-slate-700">Add user</strong> to create a{' '}
                          {PLANS.advanced.name} account and attach it to your agency.
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
                            <th className="px-4 py-3">Joined</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3 pr-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {membersList.map((m) => {
                            const isMemberActive = m.is_active !== false;
                            return (
                              <tr
                                key={m.member_id}
                                className={`text-slate-800 transition hover:bg-slate-50/80 ${!isMemberActive ? 'opacity-70' : ''}`}
                              >
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
                                          background: `linear-gradient(135deg, ${ACCENT}, #4338ca)`,
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
                                <td className="px-4 py-3.5 text-slate-600">{formatJoined(m.joined_at)}</td>
                                <td className="px-4 py-3.5">
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isMemberActive}
                                    aria-label={isMemberActive ? 'Member active' : 'Member inactive'}
                                    onClick={() => void setMemberActive(m.member_id, !isMemberActive)}
                                    className={`relative h-7 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                      isMemberActive ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-0.5 left-0.5 block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                                        isMemberActive ? 'translate-x-[1.125rem]' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </td>
                                <td className="px-4 py-3.5 pr-5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => openPasswordModal(m)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                                  >
                                    <FiKey className="h-3.5 w-3.5" aria-hidden />
                                    Change password
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
        open={addMemberOpen}
        onClose={() => !addMemberSubmitting && setAddMemberOpen(false)}
        title="Add agency member"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" disabled={addMemberSubmitting} onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="agency-add-member-form" disabled={addMemberSubmitting}>
              {addMemberSubmitting ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        }
      >
        <form id="agency-add-member-form" onSubmit={submitAddMember} className="space-y-4">
          {addMemberFormError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{addMemberFormError}</p>
          ) : null}
          <p className="text-sm leading-relaxed text-slate-600">
            Creates a new sign-in account they can use right away. They are assigned the{' '}
            <strong className="font-semibold text-slate-900">{PLANS.advanced.name}</strong> plan and appear in Agency members
            right away (uses one seat).
          </p>
          <Input
            label="Email"
            type="email"
            autoComplete="off"
            value={addMemberEmail}
            onChange={(e) => setAddMemberEmail(e.target.value)}
            required
          />
          <div>
            <Input
              label="Username"
              type="text"
              autoComplete="off"
              value={addMemberUsername}
              onChange={(e) => setAddMemberUsername(e.target.value)}
              required
              minLength={2}
            />
            <p className="mt-1.5 text-xs text-slate-500">Stored as display name (profile full name).</p>
          </div>
          <div>
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={addMemberPassword}
              onChange={(e) => setAddMemberPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="mt-1.5 text-xs text-slate-500">At least 8 characters. Share it with the member securely.</p>
          </div>
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
            Create a join URL for your team. You can add several links with different labels, use limits, or expiry
            dates. Everyone who joins gets the <strong className="font-semibold text-slate-800">{PLANS.advanced.name}</strong>{' '}
            plan.
          </p>
          <div
            className="pointer-events-none select-none rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-3 opacity-[0.52] saturate-[0.65]"
            title={`Member invite plan is fixed to ${PLANS.advanced.name}.`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Plan for this invite</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-800">{PLANS.advanced.name}</p>
            <p className="mt-1 text-xs text-slate-500">Fixed — member links always use this tier.</p>
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

      <Modal
        open={Boolean(passwordMember)}
        onClose={() => !passwordSaving && setPasswordMember(null)}
        title={passwordMember ? `New password — ${passwordMember.full_name || passwordMember.email || 'Member'}` : 'New password'}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" disabled={passwordSaving} onClick={() => setPasswordMember(null)}>
              Cancel
            </Button>
            <Button type="submit" form="agency-member-password-form" disabled={passwordSaving}>
              {passwordSaving ? 'Saving…' : 'Update password'}
            </Button>
          </div>
        }
      >
        <form id="agency-member-password-form" onSubmit={submitMemberPassword} className="space-y-4">
          {passwordFormError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{passwordFormError}</p>
          ) : null}
          <p className="text-sm text-slate-600">
            Sets this member&apos;s sign-in password for their account (email login). Share the new password with them
            securely.
          </p>
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={newMemberPassword}
            onChange={(e) => setNewMemberPassword(e.target.value)}
            minLength={8}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmMemberPassword}
            onChange={(e) => setConfirmMemberPassword(e.target.value)}
            minLength={8}
          />
        </form>
      </Modal>

      {toast ? <Toast message={toast.message} type={toast.type} onDismiss={dismiss} duration={3200} /> : null}
    </div>
  );
}
