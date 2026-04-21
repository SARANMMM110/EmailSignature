import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar.jsx';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)]"
          aria-hidden
        />
        <main className="relative flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
