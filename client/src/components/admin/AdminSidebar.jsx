import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiLink,
  FiBriefcase,
  FiSettings,
  FiLogOut,
  FiArrowLeftCircle,
} from 'react-icons/fi';
import { clearAdminToken } from '../../lib/adminApi.js';
import { BrandLockup } from '../BrandLockup.jsx';

const navCls = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-indigo-500/15 text-white shadow-inner ring-1 ring-indigo-400/30'
      : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`;

export function AdminSidebar() {
  const navigate = useNavigate();

  const logoutAdmin = () => {
    clearAdminToken();
    navigate('/admin/login', { replace: true });
  };

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-slate-800/80 bg-slate-950 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.4)]">
      <div className="border-b border-slate-800/80 px-4 py-6">
        <Link to="/admin/dashboard" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-900/40 ring-1 ring-white/10 transition group-hover:scale-[1.02]">
            S
          </span>
          <span className="leading-tight">
            <span className="block font-semibold tracking-tight text-white">
              <BrandLockup accentClassName="text-indigo-200" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300/90">Control</span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Menu</p>
        <NavLink to="/admin/dashboard" className={navCls} end>
          <FiGrid className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
          Dashboard
        </NavLink>
        <NavLink to="/admin/registration-links" className={navCls}>
          <FiLink className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
          Registration links
        </NavLink>
        <NavLink to="/admin/agency" className={navCls}>
          <FiBriefcase className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
          Agencies
        </NavLink>
        <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Settings</p>
        <NavLink to="/admin/account" className={navCls}>
          <FiSettings className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
          Admin account
        </NavLink>
      </nav>

      <div className="border-t border-slate-800/80 p-3 space-y-2">
        <button
          type="button"
          onClick={logoutAdmin}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
        >
          <FiLogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
        <Link
          to="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/50 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/80 hover:text-white"
        >
          <FiArrowLeftCircle className="h-4 w-4" aria-hidden />
          Back to app
        </Link>
      </div>
    </aside>
  );
}
