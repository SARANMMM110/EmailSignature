import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

export function ProtectedRoute() {
  const location = useLocation();
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
