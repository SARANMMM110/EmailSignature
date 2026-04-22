import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiBriefcase, FiCopy, FiPlus, FiKey } from 'react-icons/fi';
import { adminApi } from '../../lib/adminApi.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'agencies' ? 'agencies' : 'tokens';

  const setTab = (next) => {
    setSearchParams(next === 'agencies' ? { tab: 'agencies' } : {}, { replace: true });
  };

  const [agencies, setAgencies] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [generateOpen, setGenerateOpen] = useState(false);
  const [agencyType, setAgencyType] = useState('500');
  const [maxSeatsInput, setMaxSeatsInput] = useState('500');
  const [expiresLocal, setExpiresLocal] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [createdPayload, setCreatedPayload] = useState(null);

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
      const [aRes, tRes] = await Promise.all([adminApi.get('/agencies'), adminApi.get('/agency-tokens')]);
      setAgencies(Array.isArray(aRes.data) ? aRes.data : []);
      setTokens(Array.isArray(tRes.data) ? tRes.data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load agency data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tierCap = useMemo(() => Number.parseInt(agencyType, 10) || 500, [agencyType]);

  const openGenerate = () => {
    setCreateError('');
    setAgencyType('500');
    setMaxSeatsInput('500');
    setExpiresLocal('');
    setGenerateOpen(true);
  };

  const submitGenerate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const cap = Number.parseInt(agencyType, 10) || 500;
      const raw = Math.floor(Number(maxSeatsInput));
      const max_seats = Number.isFinite(raw) ? Math.min(cap, Math.max(1, raw)) : cap;
      const body = {
        agency_type: agencyType,
        max_seats,
        expires_at: expiresLocal ? new Date(expiresLocal).toISOString() : undefined,
      };
      const { data } = await adminApi.post('/agency-tokens', body);
      setGenerateOpen(false);
      setCreatedPayload(data);
      showToast('Agency tier token created');
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
    const used = Boolean(t.used_by);
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

  const toggleAgency = async (id, nextActive) => {
    try {
      await adminApi.patch(`/agencies/${id}`, { is_active: nextActive });
      showToast(nextActive ? 'Agency activated' : 'Agency deactivated');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed');
    }
  };

  const tabClass = (active) =>
    `rounded-lg px-4 py-2.5 text-sm font-bold transition ${
      active
        ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  const seatOptions = useMemo(
    () => [
      { value: '100', label: 'Agency 100', seats: 100 },
      { value: '250', label: 'Agency 250', seats: 250 },
      { value: '500', label: 'Agency 500', seats: 500 },
    ],
    []
  );

  return (
    <div className="p-8 md:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <FiBriefcase className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wider">Internal</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Agencies &amp; tier tokens</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Create agency tier tokens for customers who purchased an agency plan. They redeem the token on{' '}
            <strong className="font-semibold text-slate-800">/agency-setup</strong> after signing in.
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

      <div className="mt-8 inline-flex rounded-xl border border-slate-200/80 bg-slate-100/90 p-1">
        <button type="button" className={tabClass(tab === 'tokens')} onClick={() => setTab('tokens')}>
          <span className="inline-flex items-center gap-2">
            <FiKey className="h-4 w-4 opacity-80" aria-hidden />
            Agency tier tokens
          </span>
        </button>
        <button type="button" className={tabClass(tab === 'agencies')} onClick={() => setTab('agencies')}>
          <span className="inline-flex items-center gap-2">
            <FiBriefcase className="h-4 w-4 opacity-80" aria-hidden />
            All agencies
          </span>
        </button>
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-slate-500">Loading…</p>
      ) : tab === 'tokens' ? (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-800">Tier tokens</h2>
            <Button type="button" onClick={openGenerate} className="inline-flex items-center gap-2">
              <FiPlus className="h-4 w-4" aria-hidden />
              Generate agency token
            </Button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 pl-5">Seats</th>
                  <th className="px-4 py-3">Invite link</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Used by</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 pr-5 text-right" />
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => {
                  const used = Boolean(t.used_by);
                  const active = t.is_active !== false;
                  return (
                    <tr key={t.id} className="border-b border-slate-50 last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 pl-5 font-semibold text-slate-800">
                        {t.max_seats}{' '}
                        <span className="text-xs font-medium text-slate-500">/ tier {t.agency_type}</span>
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
                            !active ? 'bg-slate-200 text-slate-600' : used ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {!active ? 'Inactive' : used ? 'Used' : 'Available'}
                        </span>
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-xs text-slate-600">
                        {t.used_by_profile?.full_name || t.used_by || '—'}
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
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-800">All agencies</h2>
          <p className="mt-1 text-sm text-slate-600">Organizations created after a tier token was redeemed.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 pl-5">Owner</th>
                  <th className="px-4 py-3">Agency</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 pr-5 text-right" />
                </tr>
              </thead>
              <tbody>
                {agencies.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 pl-5">
                      <p className="font-semibold text-slate-900">{a.owner?.full_name || a.owner_id}</p>
                      <p className="text-xs text-slate-500">{a.owner?.plan ? `Plan: ${a.owner.plan}` : null}</p>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-700">{a.agency_name || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{a.agency_type}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {a.seats_used} / {a.max_seats}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          a.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => toggleAgency(a.id, !a.is_active)}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        {a.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {agencies.length === 0 ? (
              <p className="p-8 text-center text-sm font-medium text-slate-500">No agencies yet.</p>
            ) : null}
          </div>
        </div>
      )}

      {/* Generate token */}
      <Modal
        open={generateOpen}
        onClose={() => !creating && setGenerateOpen(false)}
        title="Generate agency tier token"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" disabled={creating} onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="admin-agency-token-form" disabled={creating}>
              {creating ? 'Creating…' : 'Generate token'}
            </Button>
          </div>
        }
      >
        <form id="admin-agency-token-form" onSubmit={submitGenerate} className="space-y-5">
          {createError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{createError}</p>
          ) : null}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Agency size</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {seatOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col rounded-xl border px-3 py-3 text-sm transition ${
                    agencyType === opt.value
                      ? 'border-indigo-500 bg-indigo-50/80 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="agency-type"
                    value={opt.value}
                    checked={agencyType === opt.value}
                    onChange={() => {
                      setAgencyType(opt.value);
                      setMaxSeatsInput(String(opt.seats));
                    }}
                    className="sr-only"
                  />
                  <span className="font-bold text-slate-900">{opt.label}</span>
                  <span className="text-xs text-slate-600">{opt.seats} member seats</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="agency-token-max-users" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Max users (seats)
            </label>
            <input
              id="agency-token-max-users"
              type="number"
              min={1}
              max={tierCap}
              value={maxSeatsInput}
              onChange={(e) => setMaxSeatsInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Seat cap for the agency created from this token (1–{tierCap}, cannot exceed the tier you selected).
            </p>
          </div>
          <div>
            <label htmlFor="agency-token-expires" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Expires (optional)
            </label>
            <input
              id="agency-token-expires"
              type="datetime-local"
              value={expiresLocal}
              onChange={(e) => setExpiresLocal(e.target.value)}
              className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1.5 text-xs text-slate-500">Leave empty for no expiry on the token itself.</p>
          </div>
        </form>
      </Modal>

      {/* Created token — copy setup URL */}
      <Modal
        open={Boolean(createdPayload?.full_url || createdPayload?.token)}
        onClose={() => setCreatedPayload(null)}
        title="Invite link created"
        size="lg"
        footer={
          <Button type="button" variant="primary" onClick={() => setCreatedPayload(null)}>
            Done
          </Button>
        }
      >
        {createdPayload?.full_url || createdPayload?.token ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Send this link to the customer (same idea as a registration invite). They sign in, open it once, and
              activate their agency account.
            </p>
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase text-slate-500">Invite link</p>
              <div className="flex gap-2">
                <code className="min-w-0 flex-1 break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-800">
                  {tierInviteUrl(createdPayload)}
                </code>
                <Button
                  type="button"
                  variant="primary"
                  className="shrink-0"
                  aria-label="Copy invite link"
                  onClick={() => copyText(tierInviteUrl(createdPayload), 'Invite link copied')}
                >
                  <FiCopy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase text-slate-500">Raw token (optional)</p>
              <div className="flex gap-2">
                <code className="min-w-0 flex-1 break-all rounded-lg bg-slate-900 px-3 py-2 font-mono text-[11px] text-emerald-100">
                  {createdPayload.token}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0"
                  aria-label="Copy raw token"
                  onClick={() => copyText(createdPayload.token, 'Token copied')}
                >
                  <FiCopy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Type <span className="font-semibold">{createdPayload.agency_type}</span> ·{' '}
              <span className="font-semibold">{createdPayload.max_seats}</span> seats · ID{' '}
              <span className="font-mono text-slate-600">{createdPayload.id}</span>
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
