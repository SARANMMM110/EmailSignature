import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { GoogleIcon } from '../components/icons/GoogleIcon.jsx';
import { getAgencyJoinPreview, getPublicRegistrationLinkPreview } from '../lib/api.js';
import { clearStoredRegistrationRef, REGISTRATION_REF_STORAGE_KEY } from '../lib/registrationRef.js';
import { readAgencyJoinLinkToken, writeAgencyJoinLinkToken } from '../lib/agencyJoinLink.js';
import { BrandLockup } from '../components/BrandLockup.jsx';
import { useRegistrationRefPreviewStore } from '../store/registrationRefPreviewStore.js';
import { PLANS, normalizePlanId } from '../data/plans.js';

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refParam = searchParams.get('ref')?.trim() || '';
  const agencyLinkFromUrl = searchParams.get('agency_link')?.trim() || '';
  const agencyInviteToken = agencyLinkFromUrl || readAgencyJoinLinkToken();
  const loginHref = agencyInviteToken
    ? `/login?from=agency-join&agency_link=${encodeURIComponent(agencyInviteToken)}`
    : refParam
      ? `/login?returning=1&ref=${encodeURIComponent(refParam)}`
      : '/login';
  const { session, loading, loginWithGoogle, signupWithEmail } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [agencyPreview, setAgencyPreview] = useState(null);
  const [agencyPreviewLoading, setAgencyPreviewLoading] = useState(false);

  useEffect(() => {
    if (agencyLinkFromUrl) {
      writeAgencyJoinLinkToken(agencyLinkFromUrl);
      clearStoredRegistrationRef();
    }
  }, [agencyLinkFromUrl]);

  useEffect(() => {
    if (refParam) {
      sessionStorage.setItem(REGISTRATION_REF_STORAGE_KEY, refParam);
    }
  }, [refParam]);

  useEffect(() => {
    void useRegistrationRefPreviewStore.getState().syncFromStorage();
  }, [refParam]);

  useEffect(() => {
    if (!refParam) {
      setInviteInfo(null);
      return undefined;
    }
    let cancelled = false;
    getPublicRegistrationLinkPreview(refParam).then((data) => {
      if (!cancelled) setInviteInfo(data);
    });
    return () => {
      cancelled = true;
    };
  }, [refParam]);

  useEffect(() => {
    if (!agencyInviteToken) {
      setAgencyPreview(null);
      return undefined;
    }
    let cancelled = false;
    setAgencyPreviewLoading(true);
    getAgencyJoinPreview(agencyInviteToken)
      .then((data) => {
        if (!cancelled) setAgencyPreview(data);
      })
      .finally(() => {
        if (!cancelled) setAgencyPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [agencyInviteToken]);

  const agencyPlanMeta = useMemo(() => {
    const planId = agencyPreview?.assigned_plan ? normalizePlanId(agencyPreview.assigned_plan) : 'personal';
    return PLANS[planId] || PLANS.personal;
  }, [agencyPreview?.assigned_plan]);

  useEffect(() => {
    if (!loading && session) {
      const token = readAgencyJoinLinkToken() || agencyLinkFromUrl;
      if (token) {
        navigate(`/join?agency_link=${encodeURIComponent(token)}`, { replace: true });
        return;
      }
      navigate('/dashboard', { replace: true });
    }
  }, [session, loading, navigate, agencyLinkFromUrl]);

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const r = searchParams.get('ref')?.trim();
      if (r) {
        sessionStorage.setItem(REGISTRATION_REF_STORAGE_KEY, r);
        void useRegistrationRefPreviewStore.getState().syncFromStorage();
      }
      if (agencyInviteToken) {
        writeAgencyJoinLinkToken(agencyInviteToken);
      }
      const googleRedirect = agencyInviteToken
        ? `/join?agency_link=${encodeURIComponent(agencyInviteToken)}`
        : '/dashboard';
      const { error: err } = await loginWithGoogle(googleRedirect);
      if (err) setError(err.message || 'Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err, needsEmailConfirmation } = await signupWithEmail(
        email,
        password,
        fullName,
        agencyInviteToken ? { agencyJoinToken: agencyInviteToken } : {}
      );
      if (err) {
        setError(err.message || 'Sign up failed');
        return;
      }
      if (needsEmailConfirmation) {
        setEmailSent(true);
        return;
      }
      /* Post-signup navigation (dashboard vs /join for agency invite) is handled in useEffect when session updates. */
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-4 py-12">
        <div className="mx-auto w-full max-w-[420px] text-center">
          <Link to="/" className="inline-block text-2xl font-bold tracking-tight text-slate-900">
            <BrandLockup />
          </Link>
          <div className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
              ✉️
            </div>
            <h1 className="text-lg font-semibold text-slate-900">Check your email</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We sent a confirmation link to <strong className="text-slate-800">{email}</strong>. Open it to
              confirm your account, then you can sign in.
            </p>
            <Link
              to={loginHref}
              className="mt-8 inline-block text-sm font-semibold text-blue-600 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-4 py-12">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-block text-2xl font-bold tracking-tight text-slate-900">
            <BrandLockup />
          </Link>
          <p className="mt-2 text-sm text-slate-600">Create your account in seconds</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          {inviteInfo?.valid ? (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              You&apos;re signing up with an invite for the <strong>{inviteInfo.plan_name}</strong> plan. After you create your
              account, we&apos;ll apply that tier to your profile automatically.
            </div>
          ) : null}
          {agencyInviteToken ? (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                agencyPreviewLoading
                  ? 'border-slate-200 bg-slate-50 text-slate-700'
                  : agencyPreview?.is_valid
                    ? 'border-amber-200 bg-amber-50 text-amber-950'
                    : 'border-amber-200 bg-amber-50 text-amber-950'
              }`}
            >
              {agencyPreviewLoading ? (
                <p className="font-medium">Checking your team invitation…</p>
              ) : agencyPreview?.is_valid ? (
                <p>
                  You&apos;re signing up to join <strong>{agencyPreview.agency_name?.trim() || 'your team'}</strong>. After
                  your account is created, you&apos;ll receive the <strong>{agencyPlanMeta.name}</strong> plan from this
                  registration link.
                </p>
              ) : (
                <p>
                  This team invite isn&apos;t valid anymore (expired, full, or inactive). You can still create an account —
                  sign in afterward with a valid invite if you have one.
                </p>
              )}
            </div>
          ) : null}
          {inviteInfo && !inviteInfo.valid && refParam ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              This invite link isn&apos;t valid anymore (or it expired). You can still sign up — use a valid
              registration link later (for example after sign-in) and your plan will match that link.
            </div>
          ) : null}
          <button
            type="button"
            disabled={googleLoading || submitting}
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <GoogleIcon className="h-5 w-5" />
            )}
            Continue with Google
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider text-slate-400">
              <span className="bg-white px-3">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="signup-name" className="mb-1.5 block text-xs font-medium text-slate-600">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-xs font-medium text-slate-600">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-xs font-medium text-slate-600">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="signup-confirm" className="mb-1.5 block text-xs font-medium text-slate-600">
                Confirm password
              </label>
              <input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to={loginHref} className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
