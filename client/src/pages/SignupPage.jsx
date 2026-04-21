import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { GoogleIcon } from '../components/icons/GoogleIcon.jsx';
import { getPublicRegistrationLinkPreview } from '../lib/api.js';
import { REGISTRATION_REF_STORAGE_KEY } from '../lib/registrationRef.js';

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refParam = searchParams.get('ref')?.trim() || '';
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

  useEffect(() => {
    if (refParam) {
      sessionStorage.setItem(REGISTRATION_REF_STORAGE_KEY, refParam);
    }
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
    if (!loading && session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, loading, navigate]);

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error: err } = await loginWithGoogle();
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
      const { error: err, needsEmailConfirmation } = await signupWithEmail(email, password, fullName);
      if (err) {
        setError(err.message || 'Sign up failed');
        return;
      }
      if (needsEmailConfirmation) {
        setEmailSent(true);
        return;
      }
      navigate('/dashboard', { replace: true });
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
            Signature<span className="text-blue-600">Builder</span>
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
              to="/login"
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
            Signature<span className="text-blue-600">Builder</span>
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
          {inviteInfo && !inviteInfo.valid && refParam ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              This invite link isn&apos;t valid anymore (or it expired). You can still sign up — you&apos;ll start on the
              default plan unless you get a new link.
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
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
