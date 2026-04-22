import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.js';
import { GoogleIcon } from '../components/icons/GoogleIcon.jsx';
import { consumeAgencyInviteLink, getAgencyJoinPreview, getAgencySetupPreview } from '../lib/api.js';
import { clearStoredRegistrationRef } from '../lib/registrationRef.js';
import { PLANS, normalizePlanId } from '../data/plans.js';

function parseAgencyInvites(location, searchParams) {
  let setupToken = '';
  let joinLink = '';

  const fromQ = searchParams.get('from');
  if (fromQ === 'agency-setup') {
    setupToken = searchParams.get('token')?.trim() || '';
  } else if (fromQ === 'agency-join') {
    joinLink = searchParams.get('agency_link')?.trim() || '';
  }

  if (!setupToken && !joinLink) {
    const from = location.state?.from;
    if (from?.pathname === '/agency-setup' && from.search) {
      const q = new URLSearchParams(String(from.search).replace(/^\?/, ''));
      setupToken = q.get('token')?.trim() || '';
    }
    if (from?.pathname === '/join' && from.search) {
      const q = new URLSearchParams(String(from.search).replace(/^\?/, ''));
      joinLink = q.get('agency_link')?.trim() || '';
    }
  }

  if (!setupToken && !joinLink) {
    if (searchParams.get('agency_link')?.trim()) {
      joinLink = searchParams.get('agency_link').trim();
    } else if (searchParams.get('token')?.trim()) {
      setupToken = searchParams.get('token').trim();
    }
  }

  return { setupToken, joinLink };
}

function resolveReturnPath(location, searchParams) {
  const { setupToken, joinLink } = parseAgencyInvites(location, searchParams);
  if (setupToken) return `/agency-setup?token=${encodeURIComponent(setupToken)}`;
  if (joinLink) return `/join?agency_link=${encodeURIComponent(joinLink)}`;
  const from = location.state?.from;
  if (from && typeof from === 'object' && typeof from.pathname === 'string' && from.pathname.startsWith('/')) {
    const search =
      from.search && String(from.search).startsWith('?')
        ? from.search
        : from.search
          ? `?${String(from.search).replace(/^\?/, '')}`
          : '';
    return `${from.pathname}${search}`;
  }
  return '/dashboard';
}

function agencyTierLabel(agencyType) {
  const t = String(agencyType || '').trim();
  if (t === '100' || t === '250' || t === '500') return `Agency ${t}`;
  return t ? `Agency ${t}` : 'Agency';
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { session, loading, loginWithGoogle, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const postLoginJoinRef = useRef(false);

  const { setupToken, joinLink } = useMemo(
    () => parseAgencyInvites(location, searchParams),
    [location, searchParams]
  );

  const returnPath = useMemo(() => resolveReturnPath(location, searchParams), [location, searchParams]);

  const [setupPreview, setSetupPreview] = useState(null);
  const [joinPreview, setJoinPreview] = useState(null);
  const [invitePreviewLoading, setInvitePreviewLoading] = useState(false);

  useEffect(() => {
    if (!setupToken) {
      setSetupPreview(null);
      return undefined;
    }
    let cancelled = false;
    setInvitePreviewLoading(true);
    getAgencySetupPreview(setupToken)
      .then((data) => {
        if (!cancelled) setSetupPreview(data);
      })
      .finally(() => {
        if (!cancelled) setInvitePreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setupToken]);

  useEffect(() => {
    if (joinLink) clearStoredRegistrationRef();
  }, [joinLink]);

  useEffect(() => {
    if (!joinLink) {
      setJoinPreview(null);
      return undefined;
    }
    let cancelled = false;
    setInvitePreviewLoading(true);
    getAgencyJoinPreview(joinLink)
      .then((data) => {
        if (!cancelled) setJoinPreview(data);
      })
      .finally(() => {
        if (!cancelled) setInvitePreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [joinLink]);

  useEffect(() => {
    if (!session) postLoginJoinRef.current = false;
  }, [session]);

  useEffect(() => {
    if (loading || !session) return;

    if (joinLink) {
      if (invitePreviewLoading) return;
      if (!joinPreview) return;
      if (!joinPreview.is_valid) {
        navigate(`/join?agency_link=${encodeURIComponent(joinLink)}`, { replace: true });
        return;
      }
      if (postLoginJoinRef.current) return;
      postLoginJoinRef.current = true;
      (async () => {
        try {
          await consumeAgencyInviteLink(joinLink);
          navigate('/dashboard', { replace: true });
        } catch {
          postLoginJoinRef.current = false;
          navigate(`/join?agency_link=${encodeURIComponent(joinLink)}`, { replace: true });
        }
      })();
      return;
    }

    navigate(returnPath, { replace: true });
  }, [
    session,
    loading,
    joinLink,
    invitePreviewLoading,
    joinPreview,
    navigate,
    returnPath,
  ]);

  const inviteBanner = useMemo(() => {
    if (setupToken) {
      const tier = agencyTierLabel(setupPreview?.agency_type);
      const valid = setupPreview?.is_valid && !setupPreview?.expired && !setupPreview?.already_used;
      const invalidMsg = setupPreview?.already_used
        ? 'This agency invitation has already been used.'
        : setupPreview?.expired
          ? 'This agency invitation has expired.'
          : setupPreview && !setupPreview.is_valid
            ? 'This invitation link is not valid.'
            : null;
      return {
        kind: 'setup',
        show: true,
        valid,
        invalidMsg: !invitePreviewLoading && setupPreview && !valid ? invalidMsg : null,
        planLine: valid
          ? `You'll be assigned the ${tier} plan (organization tier).`
          : invitePreviewLoading
            ? 'Checking your invitation…'
            : null,
        joinLine: valid
          ? 'After you sign in, use Activate Agency Account on the next page — nothing happens until you confirm.'
          : null,
      };
    }
    if (joinLink) {
      const planId = joinPreview?.assigned_plan ? normalizePlanId(joinPreview.assigned_plan) : 'personal';
      const planName = PLANS[planId]?.name || 'Personal';
      const agencyName = joinPreview?.agency_name?.trim() || 'the team you were invited to';
      const valid = joinPreview?.is_valid;
      const invalidMsg =
        !invitePreviewLoading && joinPreview && !valid
          ? joinPreview.expired
            ? 'This invitation link has expired.'
            : joinPreview.link_full
              ? 'This invitation is no longer available (all seats taken).'
              : joinPreview.agency_full
                ? 'This agency has reached its maximum member count.'
                : 'This invite link is not valid.'
          : null;
      return {
        kind: 'join',
        show: true,
        valid,
        invalidMsg,
        planLine: valid
          ? `You'll be assigned the ${planName} plan.`
          : invitePreviewLoading
            ? 'Checking your invitation…'
            : null,
        joinLine: valid
          ? `Joining: ${agencyName}. After you sign in, your invitation applies automatically and your plan appears in the sidebar.`
          : null,
      };
    }
    return { show: false };
  }, [setupToken, joinLink, setupPreview, joinPreview, invitePreviewLoading]);

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error: err } = await loginWithGoogle(returnPath);
      if (err) setError(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { error: err } = await loginWithEmail(email, password);
      if (err) {
        setError(err.message || 'Sign in failed');
        return;
      }
      /* Post-login navigation (including agency invite) is handled in useEffect. */
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-4 py-12">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-block text-2xl font-bold tracking-tight text-slate-900">
            Signature<span className="text-blue-600">Builder</span>
          </Link>
          <p className="mt-2 text-sm text-slate-600">Sign in to manage your email signatures</p>
        </div>

        {inviteBanner.show ? (
          <div
            className={`mb-6 flex gap-3 rounded-xl px-4 py-4 text-white shadow-md ${
              inviteBanner.valid === false && inviteBanner.invalidMsg
                ? 'bg-gradient-to-br from-amber-700 to-orange-600'
                : 'bg-gradient-to-br from-amber-500 to-orange-500'
            }`}
            role="status"
          >
            <FiCheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-white/95" aria-hidden />
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold tracking-tight">Registration link active</p>
              {inviteBanner.invalidMsg ? (
                <p className="mt-1 text-sm font-medium text-white/95">{inviteBanner.invalidMsg}</p>
              ) : (
                <>
                  {inviteBanner.planLine ? (
                    <p className="mt-1 text-sm font-medium leading-snug text-white/95">{inviteBanner.planLine}</p>
                  ) : null}
                  {inviteBanner.joinLine ? (
                    <p className="mt-1 text-sm font-medium leading-snug text-white/90">{inviteBanner.joinLine}</p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
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
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-slate-600">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-slate-600">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
