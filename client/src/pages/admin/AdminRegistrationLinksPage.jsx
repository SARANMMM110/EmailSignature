import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiLink,
  FiPlus,
  FiCopy,
  FiPause,
  FiPlay,
  FiTrash2,
  FiUsers,
  FiCalendar,
  FiInbox,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { adminApi } from '../../lib/adminApi.js';
import { PLANS, PLAN_ORDER } from '../../data/plans.js';

function planLabel(pid) {
  return PLANS[pid]?.name || pid;
}

function planBadgeClass(pid) {
  if (pid === 'ultimate') return 'bg-violet-100 text-violet-800 ring-violet-200/80';
  if (pid === 'advanced') return 'bg-emerald-100 text-emerald-800 ring-emerald-200/80';
  return 'bg-slate-100 text-slate-700 ring-slate-200/80';
}

function formatExpiry(iso) {
  if (!iso) return 'No expiry';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function AdminRegistrationLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [planId, setPlanId] = useState('advanced');
  const [maxUses, setMaxUses] = useState('1000');
  const [expiresLocal, setExpiresLocal] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setListError('');
    try {
      const { data } = await adminApi.get('/registration-links');
      setLinks(data?.links || []);
    } catch (e) {
      setListError(e.response?.data?.message || 'Could not load links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(() => links.find((l) => l.id === selectedId) || null, [links, selectedId]);

  const signupBase = typeof window !== 'undefined' ? window.location.origin : '';
  const linkUrl = (code) => `${signupBase}/signup?ref=${encodeURIComponent(code)}`;

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2800);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch {
      window.prompt('Copy this URL:', text);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const body = {
        plan_id: planId,
        max_uses: maxUses.trim() === '' ? null : Number(maxUses),
        expires_at: expiresLocal ? new Date(expiresLocal).toISOString() : null,
      };
      if (body.max_uses !== null && (!Number.isFinite(body.max_uses) || body.max_uses < 1)) {
        setCreateError('Max uses must be a positive number, or leave empty for unlimited.');
        return;
      }
      const { data } = await adminApi.post('/registration-links', body);
      if (data?.link) {
        setLinks((prev) => [data.link, ...prev]);
        setSelectedId(data.link.id);
        setShowCreate(false);
        setMaxUses('1000');
        setExpiresLocal('');
        setPlanId('advanced');
        showToast('Invite link created');
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const toggleDisabled = async (link) => {
    try {
      const { data } = await adminApi.patch(`/registration-links/${link.id}`, { disabled: !link.disabled });
      if (data?.link) {
        setLinks((prev) => prev.map((x) => (x.id === link.id ? data.link : x)));
        showToast(data.link.disabled ? 'Link disabled' : 'Link enabled');
      }
    } catch (e) {
      window.alert(e.response?.data?.message || 'Update failed');
    }
  };

  const removeLink = async (link) => {
    if (!window.confirm(`Delete link ${link.code}? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/registration-links/${link.id}`);
      setLinks((prev) => prev.filter((x) => x.id !== link.id));
      if (selectedId === link.id) setSelectedId(null);
      showToast('Link deleted');
    } catch (e) {
      window.alert(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="relative p-6 sm:p-10 lg:p-12">
      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-xl shadow-slate-400/20">
          <FiCheck className="h-4 w-4 text-emerald-600" aria-hidden />
          {toast}
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <header className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-800 ring-1 ring-indigo-200/60">
              <FiLink className="h-3.5 w-3.5" aria-hidden />
              Invites
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Registration links</h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Each link assigns a <strong className="font-semibold text-slate-800">single plan tier</strong> when a new
              user signs up with that URL. Their profile plan is updated automatically — no separate checkout required for
              this grant.
            </p>
          </header>
          <button
            type="button"
            onClick={() => {
              setShowCreate((v) => !v);
              setCreateError('');
            }}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 lg:self-auto"
          >
            {showCreate ? (
              <>
                <FiX className="h-4 w-4" aria-hidden />
                Close
              </>
            ) : (
              <>
                <FiPlus className="h-4 w-4" aria-hidden />
                Create link
              </>
            )}
          </button>
        </div>

        {showCreate ? (
          <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/30">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">New invite link</h2>
              <p className="mt-1 text-sm text-slate-600">Choose the plan tier and usage limits for this URL.</p>
            </div>
            <form className="p-6 sm:p-8" onSubmit={handleCreate}>
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Plan tier</label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    required
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {PLAN_ORDER.map((pid) => (
                      <option key={pid} value={pid}>
                        {planLabel(pid)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    New signups through this link receive this tier on their profile.
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Max uses</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="mt-2 text-xs text-slate-500">Clear the field for unlimited redemptions.</p>
                </div>
                <div className="lg:col-span-5">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Expires (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresLocal}
                    onChange={(e) => setExpiresLocal(e.target.value)}
                    className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
                >
                  <FiPlus className="h-4 w-4" aria-hidden />
                  {creating ? 'Creating…' : 'Generate link'}
                </button>
              </div>
              {createError ? <p className="mt-4 text-sm font-medium text-red-600">{createError}</p> : null}
            </form>
          </section>
        ) : null}

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">All links ({links.length})</h2>
            </div>
            {listError ? <p className="mt-4 text-sm font-medium text-red-600">{listError}</p> : null}
            {loading ? (
              <div className="mt-12 flex justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {links.map((link) => {
                  const active = !link.disabled;
                  const unlimited = link.max_uses == null;
                  const isSel = selectedId === link.id;
                  return (
                    <li key={link.id}>
                      <div
                        className={`flex w-full flex-col gap-4 rounded-2xl border p-5 transition-all sm:flex-row sm:items-center sm:justify-between ${
                          isSel
                            ? 'border-indigo-400/70 bg-gradient-to-br from-indigo-50/90 to-white shadow-md ring-2 ring-indigo-500/20'
                            : 'border-slate-200/90 bg-white shadow-sm hover:border-slate-300 hover:shadow'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(link.id)}
                          className="flex min-w-0 flex-1 flex-col gap-4 text-left sm:flex-row sm:items-center sm:gap-6"
                        >
                          <div className="min-w-0 flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-sm font-semibold tracking-wide text-white">
                              {link.code}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ${planBadgeClass(link.plan_id)}`}
                            >
                              {planLabel(link.plan_id)}
                            </span>
                            {unlimited ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200/80">
                                Unlimited uses
                              </span>
                            ) : null}
                            {!active ? (
                              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-800 ring-1 ring-red-200/80">
                                Disabled
                              </span>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 sm:shrink-0">
                            <span className="inline-flex items-center gap-1.5">
                              <FiUsers className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                              {link.uses_count}
                              {unlimited ? '' : ` / ${link.max_uses}`}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <FiCalendar className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                              {formatExpiry(link.expires_at)}
                            </span>
                          </div>
                        </button>
                        <div className="flex shrink-0 gap-1.5 sm:ml-auto">
                          <button
                            type="button"
                            title="Copy invite URL"
                            onClick={() => copyText(linkUrl(link.code))}
                            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            <FiCopy className="h-4 w-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            title={active ? 'Disable' : 'Enable'}
                            onClick={() => toggleDisabled(link)}
                            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            {active ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => removeLink(link)}
                            className="rounded-xl border border-slate-200 bg-white p-2.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                          >
                            <FiTrash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {links.length === 0 && !loading ? (
                  <li className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 py-16 text-center">
                    <FiInbox className="h-12 w-12 text-slate-300" aria-hidden />
                    <p className="mt-4 text-sm font-medium text-slate-700">No invite links yet</p>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">Create a link to share a signup URL with a fixed plan tier.</p>
                  </li>
                ) : null}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-200/25 lg:col-span-2 lg:sticky lg:top-8 lg:self-start">
            {selected ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected link</p>
                <p className="mt-3 font-mono text-xl font-bold tracking-tight text-slate-900">{selected.code}</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Plan</span>
                    <span className="font-semibold text-slate-900">{planLabel(selected.plan_id)}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Uses</span>
                    <span className="font-semibold text-slate-900">
                      {selected.uses_count}
                      {selected.max_uses == null ? ' (no cap)' : ` / ${selected.max_uses}`}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Expires</span>
                    <span className="text-right font-medium text-slate-800">{formatExpiry(selected.expires_at)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Status</span>
                    <span className={`font-semibold ${selected.disabled ? 'text-red-600' : 'text-emerald-600'}`}>
                      {selected.disabled ? 'Disabled' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Invite URL</p>
                  <p className="mt-2 break-all font-mono text-xs leading-relaxed text-indigo-900">{linkUrl(selected.code)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(linkUrl(selected.code))}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <FiCopy className="h-4 w-4" aria-hidden />
                  Copy invite URL
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="rounded-2xl bg-slate-100 p-5 text-slate-400">
                  <FiLink className="h-10 w-10" aria-hidden />
                </div>
                <p className="mt-5 text-sm font-semibold text-slate-800">Select a link</p>
                <p className="mt-2 max-w-[200px] text-xs leading-relaxed text-slate-500">
                  Details and copy actions appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
