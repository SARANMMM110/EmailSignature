import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { getApiOrigin } from '../../lib/api.js';
import { adminApi, setAdminToken, getAdminToken } from '../../lib/adminApi.js';
import { BrandLockup } from '../../components/BrandLockup.jsx';

const DEMO_ACCOUNTS = [
  ['admin', 'AdminDemo!2026'],
  // ['saran', 'Saran123'],
  // ['just', 'Just123'],
  // ['vineet', 'Vineet123'],
  // ['frank', 'Frank123'],
];

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setChecking(false);
      return;
    }
    adminApi
      .get('/auth/me')
      .then(() => navigate(from, { replace: true }))
      .catch(() => {
        setChecking(false);
      });
  }, [from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const origin = getApiOrigin();
      const { data } = await axios.post(`${origin}/api/admin/auth/login`, {
        username: username.trim(),
        password,
      });
      if (!data?.token) {
        setError('Unexpected server response.');
        return;
      }
      setAdminToken(data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.25),transparent)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" aria-hidden />

      <div className="relative mx-auto w-full max-w-[440px]">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-xl shadow-indigo-950/50 ring-1 ring-white/10">
              S
            </span>
            <span>
              <span className="block text-xl font-semibold tracking-tight text-white">
                <BrandLockup accentClassName="text-indigo-200" />
              </span>
              <span className="mt-1 block text-xs font-bold uppercase tracking-[0.25em] text-indigo-300/90">
                Admin console
              </span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-slate-400">Sign in with your admin username and password</p>
          {import.meta.env.DEV ? (
            <div className="mx-auto mt-4 max-w-sm rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 text-left text-xs leading-relaxed text-slate-400 backdrop-blur-sm">
              <p className="font-semibold text-slate-300">Local demo logins</p>
              <ul className="mt-2 space-y-1 font-mono text-[11px] text-indigo-200/95">
                {DEMO_ACCOUNTS.map(([u, p]) => (
                  <li key={u}>
                    <span className="text-slate-500">{u}</span> / {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                {error}
              </div>
            ) : null}

            <div>
              <label htmlFor="admin-login-user" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <FiUser className="h-3.5 w-3.5" aria-hidden />
                Username
              </label>
              <input
                id="admin-login-user"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-600/80 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="admin"
              />
            </div>
            <div>
              <label htmlFor="admin-login-password" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <FiLock className="h-3.5 w-3.5" aria-hidden />
                Password
              </label>
              <input
                id="admin-login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-600/80 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Continue'}
              {!submitting ? <FiArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden /> : null}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-500">
            <Link to="/login" className="font-medium text-indigo-300 hover:text-indigo-200 hover:underline">
              User sign in
            </Link>
            <span className="mx-2 text-slate-600">·</span>
            <Link to="/" className="font-medium text-slate-400 hover:text-slate-300 hover:underline">
              Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
