import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiBriefcase, FiCopy, FiPlus, FiUserPlus } from 'react-icons/fi';
import { adminApi } from '../../lib/adminApi.js';
import { PLANS } from '../../data/plans.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';

function formatWhen(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function agencySetupUrl(token) {
  if (typeof window === 'undefined') return '';
  const base = window.location.origin.replace(/\/+$/, '');
  return `${base}/agency-setup?token=${encodeURIComponent(token)}`;
}

/** Prefer server `full_url` (CLIENT_URL); fallback for older API responses. */
function tierInviteUrl(row) {
  const u = row?.full_url?.trim();
  if (u) return u;
  return agencySetupUrl(row?.token);
}

export function AdminAgencyPage() {
  const [tokens, setTokens] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [generateOpen, setGenerateOpen] = useState(false);
  const [agencyType, setAgencyType] = useState('500');
  const [maxLinkUsesInput, setMaxLinkUsesInput] = useState('');
  const [expiresLocal, setExpiresLocal] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserEmail, setAddUserEmail] = useState('');
  const [addUserUsername, setAddUserUsername] = useState('');
  const [addUserPassword, setAddUserPassword] = useState('');
  const [addUserSubmitting, setAddUserSubmitting] = useState(false);
  const [addUserFormError, setAddUserFormError] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 3200);
  };

  const copyText = async (text, msg = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(msg);
    } catch {
      window.prompt('Copy:', text);
    }
  };

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { data: tokData } = await adminApi.get('/agency-tokens');
      setTokens(Array.isArray(tokData) ? tokData : []);
      try {
        const { data: appData } = await adminApi.get('/app-users');
        setAppUsers(Array.isArray(appData?.users) ? appData.users : []);
      } catch {
        setAppUsers([]);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load agency data.');
      setTokens([]);
      setAppUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openGenerate = () => {
    setCreateError('');
    setAgencyType('500');
    setMaxLinkUsesInput('');
    setExpiresLocal('');
    setGenerateOpen(true);
  };

  const openAddUser = () => {
    setAddUserFormError('');
    setAddUserEmail('');
    setAddUserUsername('');
    setAddUserPassword('');
    setAddUserOpen(true);
  };

  const submitAddUser = async (e) => {
    e.preventDefault();
    setAddUserFormError('');
    setAddUserSubmitting(true);
    try {
      await adminApi.post('/app-users', {
        email: addUserEmail.trim(),
        username: addUserUsername.trim(),
        password: addUserPassword,
      });
      setAddUserOpen(false);
      setAddUserEmail('');
      setAddUserUsername('');
      setAddUserPassword('');
      showToast(`User created with ${PLANS.advanced.name} plan`);
      try {
        const { data: appData } = await adminApi.get('/app-users');
        setAppUsers(Array.isArray(appData?.users) ? appData.users : []);
      } catch {
        /* user created; list will refresh on next page load */
      }
    } catch (err) {
      setAddUserFormError(err.response?.data?.message || err.message || 'Could not create user.');
    } finally {
      setAddUserSubmitting(false);
    }
  };

  const submitGenerate = async (e) => {
    e.preventDefault();
    setCreateError('');
    const cap = Number.parseInt(agencyType, 10) || 500;
    const trimmedUses = maxLinkUsesInput.trim();
    let max_link_uses = null;
    if (trimmedUses !== '') {
      const n = Math.floor(Number(trimmedUses));
      if (!Number.isFinite(n) || n < 1 || n > 5000) {
        setCreateError('Max uses must be empty for unlimited or a whole number from 1 to 5000.');
        return;
      }
      max_link_uses = n;
    }
    setCreating(true);
    try {
      const body = {
        agency_type: agencyType,
        max_seats: cap,
        max_link_uses,
        expires_at: expiresLocal ? new Date(expiresLocal).toISOString() : undefined,
      };
      const { data } = await adminApi.post('/agency-tokens', body);
      setGenerateOpen(false);
      const setupUrl = tierInviteUrl(data);
      if (setupUrl) {
        await copyText(setupUrl, 'Token created — setup link copied');
      } else {
        showToast('Agency tier token created');
      }
      await load();
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Could not create token.');
    } finally {
      setCreating(false);
    }
  };

  const deactivateToken = async (id) => {
    if (!window.confirm('Deactivate this tier token? It can no longer be used to create an agency.')) return;
    try {
      await adminApi.delete(`/agency-tokens/${id}`);
      showToast('Token deactivated');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed');
    }
  };

  const deleteTokenPermanent = async (t) => {
    const used = Number(t.link_activations_used) > 0 || Boolean(t.used_by);
    const msg = used
      ? 'Permanently delete this tier token? The agency created from it stays; this only removes the token record. This cannot be undone.'
      : 'Permanently delete this tier token? Invite links will stop working. This cannot be undone.';
    if (!window.confirm(msg)) return;
    try {
      await adminApi.delete(`/agency-tokens/${t.id}/permanent`);
      showToast('Token deleted');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed');
    }
  };

  const seatOptions = useMemo(
    () => [
      { value: '100', label: 'Agency 100', seats: 100 },
      { value: '250', label: 'Agency 250', seats: 250 },
      { value: '500', label: 'Agency 500', seats: 500 },
    ],
    []
  );

  const setAppUserDisabled = async (userId, is_disabled) => {
    try {
      await adminApi.patch(`/app-users/${encodeURIComponent(userId)}`, { is_disabled });
      showToast(is_disabled ? 'User disabled (cannot sign in)' : 'User enabled');
      const { data: appData } = await adminApi.get('/app-users');
      setAppUsers(Array.isArray(appData?.users) ? appData.users : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Update failed');
    }
  };

  const removeAppUser = async (userId) => {
    if (
      !window.confirm(
        'Permanently delete this user account and their app data? This cannot be undone.'
      )
    ) {
      return;
    }
    try {
      await adminApi.delete(`/app-users/${encodeURIComponent(userId)}`);
      showToast('User removed');
      const { data: appData } = await adminApi.get('/app-users');
      setAppUsers(Array.isArray(appData?.users) ? appData.users : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Remove failed');
    }
  };

  return (
    <div className="p-8 md:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <FiBriefcase className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wider">Internal</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Agency tier tokens</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Create agency tier tokens for customers who purchased an agency plan. They open your invite link, sign in,
            then confirm on <strong className="font-semibold text-slate-800">/agency-setup</strong> (or use the
            sign-in-first link we show after generation).
          </p>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Each token matches a purchased tier (seat capacity per organization). Optional{' '}
            <strong className="font-semibold text-slate-700">max uses</strong> limits how many separate organizations can
            activate from the same link; leave it empty for unlimited. The organization name is set when someone
            activates (from their profile).
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      ) : null}

      {toast ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900">
          {toast}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-800">Tier tokens</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" onClick={openAddUser} className="inline-flex items-center gap-2">
                <FiUserPlus className="h-4 w-4" aria-hidden />
                Add user
              </Button>
              <Button type="button" onClick={openGenerate} className="inline-flex items-center gap-2">
                <FiPlus className="h-4 w-4" aria-hidden />
                Generate agency token
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 pl-5" title="Purchased agency tier (e.g. Agency 100).">
                    Plan
                  </th>
                  <th
                    className="px-4 py-3"
                    title="Seats in use across all organizations from this link vs total purchased seat capacity."
                  >
                    Seats
                  </th>
                  <th className="px-4 py-3">Invite link</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 pr-5 text-right" />
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => {
                  const active = t.is_active !== false;
                  const cap = Number(t.agency_max_seats ?? t.max_seats) || 0;
                  const seatsUsed = Number(t.agency_seats_used ?? 0) || 0;
                  const linkUsed = Number(t.link_activations_used) || 0;
                  const linkMaxRaw = t.link_activations_max ?? t.max_link_uses;
                  const linkMax = linkMaxRaw == null ? null : Number(linkMaxRaw);
                  const linkFull = linkMax != null && linkUsed >= linkMax;
                  return (
                    <tr key={t.id} className="border-b border-slate-50 last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 pl-5 font-semibold text-slate-800">
                        <span title={`Up to ${t.max_seats ?? '—'} seats per organization for this tier.`}>
                          Agency {t.agency_type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-slate-800">
                        <span title="Seats in use vs total seat capacity for organizations created from this link.">
                          {seatsUsed} / {cap}
                        </span>
                      </td>
                      <td className="max-w-[min(100vw,320px)] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code
                            className="min-w-0 flex-1 truncate rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700"
                            title={tierInviteUrl(t)}
                          >
                            {tierInviteUrl(t)}
                          </code>
                          <button
                            type="button"
                            className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                            aria-label="Copy invite link"
                            onClick={() => copyText(tierInviteUrl(t), 'Invite link copied')}
                          >
                            <FiCopy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            !active ? 'bg-slate-200 text-slate-600' : linkFull ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {!active ? 'Inactive' : linkFull ? 'Full' : 'Available'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatWhen(t.expires_at)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatWhen(t.created_at)}</td>
                      <td className="px-4 py-3 pr-5 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                          {active ? (
                            <button
                              type="button"
                              onClick={() => deactivateToken(t.id)}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              Deactivate
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => deleteTokenPermanent(t)}
                            className="text-xs font-bold text-slate-600 hover:text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tokens.length === 0 ? (
              <p className="p-8 text-center text-sm font-medium text-slate-500">No tier tokens yet. Generate one for a customer.</p>
            ) : null}
          </div>

          <section className="mt-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">App users</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  Accounts created with <strong className="font-semibold text-slate-800">Add user</strong> (
                  {PLANS.advanced.name} plan). <strong className="font-semibold text-slate-800">Disable</strong> blocks sign-in;{' '}
                  <strong className="font-semibold text-slate-800">Remove</strong> deletes the account and related data.
                </p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 pl-5">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-slate-500">
                        No app users yet. Use <strong className="text-slate-700">Add user</strong> above to provision an
                        account.
                      </td>
                    </tr>
                  ) : (
                    appUsers.map((u) => {
                      const disabled = Boolean(u.is_disabled);
                      return (
                        <tr key={u.id || u.user_id} className="border-b border-slate-50 last:border-0">
                          <td className="px-4 py-3 pl-5 font-semibold text-slate-800">{u.full_name || '—'}</td>
                          <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">{u.email || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-900">
                              {PLANS.advanced.name}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatWhen(u.created_at)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                disabled ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {disabled ? 'Disabled' : 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3 pr-5 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => void setAppUserDisabled(u.user_id, !disabled)}
                                className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline"
                              >
                                {disabled ? 'Enable' : 'Disable'}
                              </button>
                              <button
                                type="button"
                                onClick={() => void removeAppUser(u.user_id)}
                                className="text-xs font-bold text-red-600 hover:underline"
                              >
                                Remove
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
          </section>
        </div>
      )}

      {/* Generate token */}
      <Modal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate Agency Tier Token"
        tone="dark"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setGenerateOpen(false)}
              className="order-1 !border-slate-400 !bg-slate-100 !text-slate-900 shadow-sm hover:!bg-white hover:!text-slate-900 focus:ring-slate-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="admin-agency-token-form"
              disabled={creating}
              className="order-2 bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500"
            >
              {creating ? 'Generating link…' : 'Generate Token'}
            </Button>
          </div>
        }
      >
        <form id="admin-agency-token-form" onSubmit={submitGenerate} className="space-y-5 text-slate-200">
          {createError ? (
            <p className="rounded-lg border border-red-400/40 bg-red-950/50 px-3 py-2 text-sm text-red-200">{createError}</p>
          ) : null}
          <div>
            <label htmlFor="agency-tier-select" className="mb-1.5 block text-sm font-medium text-slate-200">
              Agency Tier <span className="text-red-400">*</span>
            </label>
            <select
              id="agency-tier-select"
              value={agencyType}
              onChange={(e) => setAgencyType(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {seatOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Agency {opt.seats} (up to {opt.seats} seats)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="agency-token-max-uses" className="mb-1.5 block text-sm font-medium text-slate-200">
              Max Uses (Optional)
            </label>
            <input
              id="agency-token-max-uses"
              type="number"
              inputMode="numeric"
              min={1}
              max={5000}
              step={1}
              placeholder="Unlimited"
              value={maxLinkUsesInput}
              onChange={(e) => setMaxLinkUsesInput(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <p className="mt-1.5 text-xs text-slate-400">Leave empty for unlimited uses</p>
          </div>
          <div>
            <label htmlFor="agency-token-expires" className="mb-1.5 block text-sm font-medium text-slate-200">
              Expiration Date (Optional)
            </label>
            <input
              id="agency-token-expires"
              type="datetime-local"
              value={expiresLocal}
              onChange={(e) => setExpiresLocal(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <p className="mt-1.5 text-xs text-slate-400">Leave empty for no expiration</p>
          </div>
          <div className="rounded-xl border border-cyan-700/50 bg-cyan-950/40 px-4 py-3 text-sm leading-relaxed text-cyan-100/95">
            Users who register with this link will become <strong className="font-semibold text-white">agency owners</strong>{' '}
            and gain access to their own Agency Dashboard where they can invite members.
          </div>
        </form>
      </Modal>

      {/* Add app user (Gold / advanced tier) */}
      <Modal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        title="Add app user"
        tone="dark"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAddUserOpen(false)}
              className="order-1 !border-slate-400 !bg-slate-100 !text-slate-900 shadow-sm hover:!bg-white hover:!text-slate-900 focus:ring-slate-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="admin-add-app-user-form"
              disabled={addUserSubmitting}
              className="order-2 bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500"
            >
              {addUserSubmitting ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        }
      >
        <form id="admin-add-app-user-form" onSubmit={submitAddUser} className="space-y-5 text-slate-200">
          {addUserFormError ? (
            <p className="rounded-lg border border-red-400/40 bg-red-950/50 px-3 py-2 text-sm text-red-200">{addUserFormError}</p>
          ) : null}
          <p className="text-sm text-slate-400">
            Creates a main-app account with email confirmed. Plan is set to <strong className="text-slate-100">{PLANS.advanced.name}</strong>{' '}
            automatically.
          </p>
          <div>
            <label htmlFor="add-user-email" className="mb-1.5 block text-sm font-medium text-slate-200">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              id="add-user-email"
              type="email"
              autoComplete="off"
              value={addUserEmail}
              onChange={(e) => setAddUserEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label htmlFor="add-user-username" className="mb-1.5 block text-sm font-medium text-slate-200">
              Username <span className="text-red-400">*</span>
            </label>
            <input
              id="add-user-username"
              type="text"
              autoComplete="off"
              value={addUserUsername}
              onChange={(e) => setAddUserUsername(e.target.value)}
              required
              minLength={2}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <p className="mt-1.5 text-xs text-slate-400">Stored as display name (profile full name).</p>
          </div>
          <div>
            <label htmlFor="add-user-password" className="mb-1.5 block text-sm font-medium text-slate-200">
              Password <span className="text-red-400">*</span>
            </label>
            <input
              id="add-user-password"
              type="password"
              autoComplete="new-password"
              value={addUserPassword}
              onChange={(e) => setAddUserPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <p className="mt-1.5 text-xs text-slate-400">At least 8 characters.</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
