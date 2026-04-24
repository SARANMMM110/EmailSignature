import { NavLink, Outlet } from 'react-router-dom';
import { FiBriefcase } from 'react-icons/fi';

const tabCls = ({ isActive }) =>
  `rounded-lg px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export function AdminAgencyLayout() {
  return (
    <div className="p-8 md:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <FiBriefcase className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wider">Internal</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Agencies</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Tier invite links for purchased agency capacity, and Silver-tier accounts you provision for customers.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <NavLink to="/admin/agency/tokens" className={tabCls}>
          Tier tokens
        </NavLink>
        <NavLink to="/admin/agency/users" className={tabCls}>
          App users
        </NavLink>
      </div>

      <Outlet />
    </div>
  );
}
