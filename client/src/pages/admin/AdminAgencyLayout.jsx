import { Outlet } from 'react-router-dom';
import { FiBriefcase } from 'react-icons/fi';

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
            Tier invite links for purchased agency capacity.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
