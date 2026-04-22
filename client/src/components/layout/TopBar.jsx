import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { getPlan } from '../../data/plans.js';
import { effectiveTier1PlanId } from '../../lib/effectiveTier1Plan.js';

function PlanBadge({ planId }) {
  const meta = getPlan(planId);
  const paid = meta.id === 'advanced' || meta.id === 'ultimate';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        paid ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-600'
      }`}
    >
      {meta.name}
    </span>
  );
}

function AgencyBadgePill({ isOwner, agencyType }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
      style={{
        background: '#1e293b',
        letterSpacing: '0.3px',
      }}
    >
      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      {isOwner ? `Agency ${agencyType || ''}`.trim() : 'Agency Member'}
    </span>
  );
}

/**
 * Sticky header with account menu: Tier 1 plan badge + agency badge (when applicable).
 * Use inside a React Router layout when you need a compact top bar (most app screens use {@link Sidebar} only).
 */
export function TopBar({ onSignOut }) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isAgencyOwner = useAuthStore((s) => s.isAgencyOwner);
  const isAgencyMember = useAuthStore((s) => s.isAgencyMember);
  const agencyInfo = useAuthStore((s) => s.agencyInfo);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const showAgencyBadge = isAgencyOwner || isAgencyMember;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="font-semibold text-slate-900">
          Signature<span className="text-blue-600">Builder</span>
        </Link>
        <nav className="hidden gap-4 text-sm text-slate-600 sm:flex">
          <Link to="/dashboard" className="hover:text-slate-900">
            Dashboard
          </Link>
          <Link to="/intro-templates" className="hover:text-slate-900">
            Templates
          </Link>
          <Link to="/settings" className="hover:text-slate-900">
            Settings
          </Link>
        </nav>
      </div>

      <div className="relative flex items-center gap-2" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex max-w-[min(100vw-8rem,280px)] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1.5 text-left transition hover:bg-slate-100"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <span className="hidden min-w-0 truncate text-xs text-slate-600 sm:inline">{user?.email}</span>
          <span className="text-slate-400" aria-hidden>
            ▾
          </span>
        </button>
        <Button variant="secondary" className="!py-1.5 !text-xs" onClick={() => onSignOut?.()}>
          Sign out
        </Button>

        {menuOpen ? (
          <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white py-3 shadow-xl ring-1 ring-slate-900/5">
            <div className="border-b border-slate-100 px-4 pb-3">
              <p className="truncate text-xs font-semibold text-slate-900">{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {profile ? <PlanBadge planId={effectiveTier1PlanId(profile)} /> : null}
                {showAgencyBadge ? (
                  <AgencyBadgePill isOwner={isAgencyOwner} agencyType={agencyInfo?.agency_type} />
                ) : null}
              </div>
            </div>
            <div className="px-2 pt-2">
              <Link
                to="/settings"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                Account settings
              </Link>
              {isAgencyOwner ? (
                <Link
                  to="/agency"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  My agency
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
