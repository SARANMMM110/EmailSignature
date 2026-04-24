import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { getAgencySetupPreview, agencyAPI } from '../lib/api.js';
import { Toast } from '../components/ui/Toast.jsx';
import { BrandLockup } from '../components/BrandLockup.jsx';
import { useToast } from '../hooks/useToast.js';

function IconBuilding({ className = 'h-14 w-14 text-blue-600' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

export function AgencySetupPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(
    () => searchParams.get('token')?.trim() || searchParams.get('tier_token')?.trim() || '',
    [searchParams]
  );
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);
  const isAgencyOwner = useAuthStore((s) => s.isAgencyOwner);
  const isAgencyMember = useAuthStore((s) => s.isAgencyMember);

  const { toast, showToast, dismiss } = useToast();
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    setPreviewLoading(true);
    getAgencySetupPreview(token)
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const typeLabel = useMemo(
    () => (preview?.agency_type ? `Type ${preview.agency_type}` : 'Agency'),
    [preview?.agency_type]
  );
  const seatsLabel = useMemo(
    () => (preview?.max_seats ? `${preview.max_seats} seats` : 'Agency seats'),
    [preview?.max_seats]
  );

  const activate = useCallback(async () => {
    setSubmitting(true);
    try {
      await agencyAPI.registerAsOwner(token);
      await useAuthStore.getState().fetchProfile();
      showToast('Agency account activated!', 'success');
      setDone(true);
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.error;
      const msg = err.response?.data?.message || err.message || 'Activation failed.';
      if (code === 'TOKEN_EXPIRED' || status === 410) {
        showToast('This agency invitation has expired', 'error');
      } else if (code === 'TOKEN_EXHAUSTED') {
        showToast(msg || 'This link has reached its activation limit.', 'error');
      } else if (code === 'ALREADY_HAS_AGENCY') {
        showToast(msg || 'You already have an agency account.', 'error');
      } else if (code === 'ALREADY_IN_AGENCY') {
        showToast(
          msg ||
            'You are still on another team. Open Account settings → Your team → Leave this team, then try this link again.',
          'error'
        );
      } else if (code === 'TOKEN_NOT_FOUND' || status === 404) {
        showToast('Invalid or inactive invitation', 'error');
      } else if (status === 409) {
        showToast(msg, 'error');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }, [token, showToast]);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-hidden />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!session) {
    const backSearch = token ? `?token=${encodeURIComponent(token)}` : '';
    const loginQs = new URLSearchParams();
    if (token) {
      loginQs.set('from', 'agency-setup');
      loginQs.set('token', token);
      loginQs.set('tier_token', token);
    }
    const loginSearch = loginQs.toString() ? `?${loginQs.toString()}` : '';
    return (
      <Navigate
        to={{ pathname: '/login', search: loginSearch }}
        replace
        state={{ from: { pathname: '/agency-setup', search: backSearch } }}
      />
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <p className="text-center text-sm font-medium text-slate-600">This page needs a valid invitation link.</p>
        <Link to="/dashboard" className="mt-4 text-sm font-semibold text-blue-600 hover:underline">
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (isAgencyOwner && !done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-4 py-16">
        <div className="mx-auto w-full max-w-[480px]">
          <Link to="/" className="mb-10 inline-block text-lg font-bold tracking-tight text-slate-900">
            <BrandLockup />
          </Link>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
            <p className="text-sm font-medium text-slate-600">You already have an agency account.</p>
            <Link
              to="/agency"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              Open agency dashboard
            </Link>
            <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-slate-600 hover:text-slate-900">
              Back to signatures
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-4 py-16">
      <div className="mx-auto w-full max-w-[480px]">
        <Link to="/" className="mb-10 inline-block text-lg font-bold tracking-tight text-slate-900">
          <BrandLockup />
        </Link>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col items-center text-center">
            {preview && preview.is_valid && !previewLoading && !preview.already_used && !preview.expired ? (
              <div className="mb-6 w-full rounded-xl border border-violet-200 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 px-4 py-3 text-left text-white shadow-md shadow-purple-500/20">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/90">Agency invitation active</p>
                <p className="mt-1 text-sm font-semibold leading-snug">
                  {session
                    ? "You're signed in — use the button below to activate your agency from this link."
                    : 'Sign in to activate your agency account from this link.'}
                </p>
                <p className="mt-2 text-xs font-medium text-white/85">
                  {typeLabel} · up to <span className="font-bold text-white">{preview?.max_seats ?? '—'}</span> seats
                  after you activate · owner link{' '}
                  <span className="font-bold text-white">
                    {preview?.owner_link_total == null
                      ? `${preview?.owner_link_used ?? 0} (unlimited)`
                      : `${preview?.owner_link_used ?? 0}/${preview.owner_link_total}`}
                  </span>
                </p>
              </div>
            ) : null}
            {isAgencyMember && !done ? (
              <div className="mb-6 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
                <p className="font-semibold">You are already on a team as a member</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-900/95">
                  This link sets up a new organization <strong className="font-semibold">you</strong> will own. First
                  leave your current team: open{' '}
                  <Link to="/settings#agency" className="font-semibold text-amber-950 underline hover:no-underline">
                    Account settings
                  </Link>
                  , scroll to <strong className="font-semibold">Your team</strong>, tap{' '}
                  <strong className="font-semibold">Leave this team</strong>, confirm, then return here.
                </p>
              </div>
            ) : null}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
              <IconBuilding />
            </div>
            {done ? (
              <>
                <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">You&apos;re all set</h1>
                <p className="mt-2 text-sm font-medium text-slate-600">Your agency account is active.</p>
                <Link
                  to="/agency"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                >
                  Go to agency dashboard
                </Link>
                <Link
                  to="/dashboard"
                  className="mt-4 inline-block text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                >
                  Go to signatures
                </Link>
              </>
            ) : (
              <>
                <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
                  You&apos;ve been invited to set up an Agency account
                </h1>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                  This gives you the ability to create your own team and invite members with their own plan level.
                </p>
                <div className="mt-6 w-full rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-left text-sm">
                  <p className="font-semibold text-slate-800">{typeLabel}</p>
                  <p className="mt-1 text-slate-600">
                    Agency capacity: <span className="font-bold text-slate-900">{seatsLabel}</span>
                  </p>
                  {previewLoading ? (
                    <p className="mt-2 text-xs text-slate-500">Checking invitation…</p>
                  ) : preview && !preview.is_valid ? (
                    <p className="mt-2 text-xs font-medium text-amber-700">
                      {preview.already_used
                        ? 'This purchase link has reached the maximum number of agency activations. Ask your administrator for a new link if you need another organization.'
                        : preview.expired
                          ? 'This agency invitation has expired.'
                          : 'This invitation is not valid.'}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={
                    submitting || previewLoading || (preview && !preview.is_valid) || isAgencyMember
                  }
                  onClick={() => void activate()}
                  className="mt-8 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Activating…' : 'Activate Agency Account'}
                </button>
                {submitting && preview?.is_valid ? (
                  <p className="mt-3 text-xs font-medium text-slate-500">This can take a few seconds…</p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {toast ? (
        <Toast message={toast.message} type={toast.type} onDismiss={dismiss} duration={3200} />
      ) : null}
    </div>
  );
}
