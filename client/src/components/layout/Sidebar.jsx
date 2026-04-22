import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FiAward, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth.js';
import { useI18n } from '../../hooks/useI18n.js';
import { normalizeLang } from '../../i18n/appStrings.js';
import { getPlan } from '../../data/plans.js';
import { effectiveTier1PlanId } from '../../lib/effectiveTier1Plan.js';
import { displayAgencyTitle } from '../../lib/agencyDisplay.js';

const NAVY = '#0c1929';
const ACCENT = '#2563eb';

function FlagFr({ className = 'h-5 w-[1.35rem] shrink-0 overflow-hidden rounded-sm shadow-sm ring-1 ring-black/10' }) {
  return (
    <svg className={className} viewBox="0 0 3 2" aria-hidden>
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#ce1126" />
    </svg>
  );
}

function FlagGb({ className = 'h-5 w-[1.35rem] shrink-0 overflow-hidden rounded-sm shadow-sm ring-1 ring-black/10' }) {
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 60,30M60,0 0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 60,30M60,0 0,30" stroke="#c8102e" strokeWidth="4" />
      <path d="M30,0V30M0,15H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0V30M0,15H60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  );
}

function IconHome({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function IconPlus({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconBolt({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

function displayName(user, profile) {
  const fn = profile?.first_name?.trim();
  const ln = profile?.last_name?.trim();
  if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
  const saved = profile?.full_name || user?.user_metadata?.full_name;
  if (saved && String(saved).trim()) return String(saved).trim();
  const email = user?.email;
  if (!email) return '';
  const local = email.split('@')[0] || '';
  const chunks = local.replace(/[._-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (chunks.length === 0) return '';
  return chunks.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

const navClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'border-l-[3px] border-[#2563eb] bg-gradient-to-r from-blue-50/90 to-transparent text-[#1d4ed8] shadow-sm shadow-blue-500/5'
      : 'border-l-[3px] border-transparent text-slate-600 hover:bg-slate-50/90 hover:text-slate-900'
  }`;

export function Sidebar() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user, profile, updateProfile, isAgencyOwner, agencyInfo } = useAuth();
  const sidebarPlanId = effectiveTier1PlanId(profile);
  const [langError, setLangError] = useState('');

  /** Saved uploads live on `profiles.avatar_url` — prefer it over stale OAuth metadata. */
  const avatarUrl =
    String(profile?.avatar_url || '').trim() ||
    String(user?.user_metadata?.picture || '').trim() ||
    String(user?.user_metadata?.avatar_url || '').trim();
  const currentLang = normalizeLang(profile?.language);
  const profileTitle = user ? displayName(user, profile) || user.email?.split('@')[0] || t('sidebar.guest') : t('sidebar.guest');

  const handleCreateClick = () => {
    navigate('/intro-templates');
  };

  const handleLanguageToggle = async () => {
    if (!user) return;
    const next = currentLang === 'fr' ? 'en' : 'fr';
    setLangError('');
    const { error } = await updateProfile({ language: next });
    if (error) setLangError(error.message || t('sidebar.langError'));
  };

  const langLabel = currentLang === 'fr' ? t('sidebar.langFrench') : t('sidebar.langEnglish');
  const Flag = currentLang === 'fr' ? FlagFr : FlagGb;

  return (
    <div className="w-[260px] shrink-0 self-start min-h-[100dvh]">
      <aside className="fixed left-0 top-0 z-20 flex h-[100dvh] max-h-[100dvh] w-[260px] flex-col overflow-hidden border-r border-slate-200/80 bg-white shadow-sidebar">
        <div className="shrink-0 px-5 pb-5 pt-6">
          <Link to="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-lg shadow-blue-500/30"
              style={{
                background: 'linear-gradient(135deg, #3b5fff 0%, #2563eb 45%, #1d4ed8 100%)',
              }}
            >
              S
            </span>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>
              Signature<span style={{ color: ACCENT }}>Builder</span>
            </span>
          </Link>
        </div>

        <div className="shrink-0 px-4">
          <button
            type="button"
            onClick={handleCreateClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-[#2563eb]/40 hover:bg-blue-50/50 hover:text-[#1d4ed8] hover:shadow-md"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[#2563eb] transition-colors group-hover:bg-white">
              <IconPlus />
            </span>
            {t('sidebar.createSignature')}
          </button>
        </div>

        <div className="mt-8 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3">
          <nav className="space-y-1 pb-4" aria-label="Main">
            <NavLink to="/dashboard" end className={navClass}>
              <IconHome />
              {t('sidebar.mySignatures')}
            </NavLink>
          </nav>
        </div>

        <div className="shrink-0 border-t border-slate-100/80 bg-gradient-to-b from-white to-slate-50/50 px-4 py-4">
        {user ? (
          <div className="mb-3 space-y-2">
            <div className="flex items-start gap-2.5 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 px-3 py-2.5 text-white shadow-md shadow-purple-500/15">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <FiAward className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/85">Current plan</p>
                <p className="truncate text-sm font-extrabold tracking-tight">
                  {getPlan(sidebarPlanId).name}
                </p>
              </div>
            </div>
            {isAgencyOwner && agencyInfo ? (
              <NavLink
                to="/agency"
                aria-label="Open agency dashboard"
                className={({ isActive }) =>
                  `flex items-start gap-2.5 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-3 py-2.5 text-left text-white shadow-md shadow-teal-600/15 outline-none ring-offset-2 transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    isActive ? 'ring-2 ring-white/40' : ''
                  }`
                }
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <FiBriefcase className="h-4 w-4" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/85">Agency owner</p>
                  <p className="truncate text-sm font-extrabold leading-snug tracking-tight">
                    {displayName(user, profile)?.trim() ||
                      displayAgencyTitle(agencyInfo, profile)}
                  </p>
                </div>
                <span className="mt-1 shrink-0 self-start text-[10px] font-bold tabular-nums text-white/95">
                  {Number(agencyInfo.seats_used) || 0}/{Number(agencyInfo.max_seats) || 0}
                </span>
              </NavLink>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleLanguageToggle}
          disabled={!user}
          aria-label={t('sidebar.langAria', { label: langLabel })}
          className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left text-slate-800 transition-colors hover:bg-slate-100/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Flag />
          <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{langLabel}</span>
        </button>
        {langError ? <p className="mt-1 px-1 text-[11px] text-red-600">{langError}</p> : null}

        <div className="my-3 h-px bg-slate-200/90" aria-hidden />

        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition hover:border-slate-200 hover:shadow-md"
        >
          {avatarUrl ? (
            <img
              key={avatarUrl}
              src={avatarUrl}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-orange-100"
              style={{
                background: 'linear-gradient(145deg, #fb923c 0%, #ea580c 55%, #c2410c 100%)',
              }}
              aria-hidden
            >
              <IconBolt className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-bold text-slate-900">{profileTitle}</p>
            <p className="truncate text-xs font-medium text-slate-500">{user?.email || '—'}</p>
          </div>
        </Link>
        </div>
      </aside>
    </div>
  );
}
