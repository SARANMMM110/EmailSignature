import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore.js';
import { consumeAgencyInviteLink, getAgencyJoinPreview } from '../lib/api.js';
import { clearStoredRegistrationRef } from '../lib/registrationRef.js';
import { PLANS, normalizePlanId } from '../data/plans.js';
import { Toast } from '../components/ui/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

export function AgencyJoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkToken = useMemo(() => searchParams.get('agency_link')?.trim() || '', [searchParams]);
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);

  const { toast, showToast, dismiss } = useToast();
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joinFailed, setJoinFailed] = useState(false);
  const autoJoinStarted = useRef(false);

  useEffect(() => {
    if (linkToken) clearStoredRegistrationRef();
  }, [linkToken]);

  useEffect(() => {
    if (!linkToken) return undefined;
    let cancelled = false;
    setPreviewLoading(true);
    getAgencyJoinPreview(linkToken)
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [linkToken]);

  const planMeta = useMemo(() => {
    const planId = preview?.assigned_plan ? normalizePlanId(preview.assigned_plan) : 'personal';
    return PLANS[planId] || PLANS.personal;
  }, [preview?.assigned_plan]);

  const agencyDisplayName = preview?.agency_name?.trim() || 'the team you were invited to';

  const invalidMsg = previewLoading
    ? null
    : !preview?.is_valid
      ? preview?.expired
        ? 'This invitation link has expired.'
        : preview?.link_full
          ? 'This invitation is no longer available (all seats taken).'
          : preview?.agency_full
            ? 'This agency has reached its maximum member count.'
            : 'This invite link is not valid.'
      : null;

  const bannerValid = Boolean(preview?.is_valid) && !invalidMsg;
  const planLine = bannerValid
    ? `You'll be assigned the ${planMeta.name} plan.`
    : previewLoading
      ? 'Checking your invitation…'
      : null;
  const joinLine = bannerValid ? `Joining: ${agencyDisplayName}` : null;

  const mapJoinError = useCallback(
    (err) => {
      const code = err.response?.data?.error;
      const status = err.response?.status;
      if (status === 410 || code === 'LINK_EXPIRED') {
        showToast('This invitation link has expired', 'error');
      } else if (code === 'LINK_FULL' || err.response?.data?.message?.toLowerCase().includes('full')) {
        showToast('This invitation is no longer available (all seats taken)', 'error');
      } else if (code === 'AGENCY_FULL' || code === 'AGENCY_INACTIVE') {
        showToast('This agency has reached its maximum member count', 'error');
      } else if (code === 'ALREADY_IN_AGENCY' || status === 409) {
        showToast('You are already a member of an agency', 'error');
      } else if (status === 404) {
        showToast('Invalid or inactive invite link', 'error');
      } else {
        showToast(err.response?.data?.message || err.message || 'Could not join.', 'error');
      }
    },
    [showToast]
  );

  const completeJoin = useCallback(async () => {
    setSubmitting(true);
    setJoinFailed(false);
    try {
      const { data, alreadyMember } = await consumeAgencyInviteLink(linkToken);
      const planName =
        PLANS[normalizePlanId(data?.assigned_plan || preview?.assigned_plan)]?.name || planMeta.name;
      const name = data?.agency_name?.trim() || agencyDisplayName;
      if (alreadyMember) {
        showToast(`You're already part of ${agencyDisplayName}. Your current plan is shown in the sidebar.`, 'success');
      } else {
        showToast(`Welcome to ${name}! Your ${planName} plan is active.`, 'success');
      }
      queueMicrotask(() => {
        navigate('/dashboard', { replace: true });
      });
    } catch (err) {
      setJoinFailed(true);
      mapJoinError(err);
    } finally {
      setSubmitting(false);
    }
  }, [linkToken, planMeta.name, agencyDisplayName, preview?.assigned_plan, showToast, navigate, mapJoinError]);

  useEffect(() => {
    if (!session || !linkToken || previewLoading || !bannerValid || joinFailed) return;
    if (autoJoinStarted.current) return;
    autoJoinStarted.current = true;
    void completeJoin();
  }, [session, linkToken, previewLoading, bannerValid, joinFailed, completeJoin]);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" aria-hidden />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!session) {
    const backSearch = linkToken ? `?agency_link=${encodeURIComponent(linkToken)}` : '';
    const loginQs = new URLSearchParams();
    if (linkToken) {
      loginQs.set('from', 'agency-join');
      loginQs.set('agency_link', linkToken);
    }
    const loginSearch = loginQs.toString() ? `?${loginQs.toString()}` : '';
    return (
      <Navigate
        to={{ pathname: '/login', search: loginSearch }}
        replace
        state={{ from: { pathname: '/join', search: backSearch } }}
      />
    );
  }

  if (!linkToken) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <p className="text-center text-sm font-medium text-slate-600">This page needs a valid team invite link.</p>
        <Link to="/dashboard" className="mt-4 text-sm font-semibold text-blue-600 hover:underline">
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/80 px-4 py-12">
      <div className="mx-auto w-full max-w-[440px]">
        <Link to="/" className="mb-8 inline-block text-lg font-bold tracking-tight text-slate-900">
          Signature<span className="text-blue-600">Builder</span>
        </Link>

        <div
          className={`mb-6 flex gap-3 rounded-xl px-4 py-4 text-white shadow-md ${
            invalidMsg ? 'bg-gradient-to-br from-amber-700 to-orange-600' : 'bg-gradient-to-br from-amber-500 to-orange-500'
          }`}
          role="status"
        >
          <FiCheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-white/95" aria-hidden />
          <div className="min-w-0 text-left">
            <p className="text-sm font-bold tracking-tight">Registration link active</p>
            {invalidMsg ? (
              <p className="mt-1 text-sm font-medium leading-snug text-white/95">{invalidMsg}</p>
            ) : (
              <>
                {planLine ? <p className="mt-1 text-sm font-medium leading-snug text-white/95">{planLine}</p> : null}
                {joinLine ? <p className="mt-1 text-sm font-medium leading-snug text-white/90">{joinLine}</p> : null}
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40">
          {previewLoading ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" aria-hidden />
              <p className="text-sm font-medium text-slate-600">Checking your invitation…</p>
            </div>
          ) : bannerValid ? (
            <div className="py-4 text-center">
              {joinFailed ? (
                <>
                  <p className="text-sm font-medium text-slate-600">
                    We couldn&apos;t finish applying this invitation. You can try again, or open your dashboard if you&apos;re
                    already set up.
                  </p>
                  {typeof preview?.seats_remaining === 'number' ? (
                    <p className="mt-3 text-xs text-slate-500">
                      Open seats on this link:{' '}
                      <span className="font-semibold text-slate-800">{preview.seats_remaining}</span>
                    </p>
                  ) : null}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void completeJoin()}
                    className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'Retrying…' : 'Try again'}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" aria-hidden />
                  <p className="text-sm font-medium text-slate-600">Applying your invitation…</p>
                  <p className="text-xs text-slate-500">Your plan will appear in the sidebar when this finishes.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-sm text-slate-600">You can close this page or return to your dashboard.</p>
              <Link
                to="/dashboard"
                className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
              >
                Go to dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      {toast ? (
        <Toast message={toast.message} type={toast.type} onDismiss={dismiss} duration={4000} />
      ) : null}
    </div>
  );
}
