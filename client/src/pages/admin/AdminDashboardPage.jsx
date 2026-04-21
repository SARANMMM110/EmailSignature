import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiLink, FiLayers, FiUserCheck, FiArrowRight } from 'react-icons/fi';
import { adminApi } from '../../lib/adminApi.js';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    adminApi
      .get('/stats')
      .then(({ data }) => {
        if (!cancelled) setStats(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.data?.message || 'Failed to load stats');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: 'Registration links',
      value: stats?.linksTotal ?? '—',
      hint: 'Total created',
      icon: FiLink,
      accent: 'from-indigo-500/20 to-violet-500/10 text-indigo-700 ring-indigo-200/60',
    },
    {
      label: 'Active links',
      value: stats?.activeLinks ?? '—',
      hint: 'Ready to accept signups',
      icon: FiLayers,
      accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-700 ring-emerald-200/60',
    },
    {
      label: 'Invite redemptions',
      value: stats?.redemptionsTotal ?? '—',
      hint: 'Users who joined via a link',
      icon: FiUserCheck,
      accent: 'from-amber-500/20 to-orange-500/10 text-amber-800 ring-amber-200/60',
    },
  ];

  return (
    <div className="p-6 sm:p-10 lg:p-12">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600/90">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Monitor invite links and how many people have signed up through them.
          </p>
        </header>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/90 px-5 py-4 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-200/50 transition hover:border-indigo-200/80 hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 ring-1 ${card.accent}`}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
                <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-slate-900">{card.value}</p>
                <p className="mt-1.5 text-sm text-slate-500">{card.hint}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50/80 p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Registration invites</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Create links that assign a plan when someone registers with your URL. Their workspace limits match the
                plan you attach to each link.
              </p>
            </div>
            <Link
              to="/admin/registration-links"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              Manage links
              <FiArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
