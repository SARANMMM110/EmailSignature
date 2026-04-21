import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { adminApi, getAdminToken } from '../../lib/adminApi.js';

export function AdminProtectedRoute() {
  const location = useLocation();
  const [gate, setGate] = useState('loading');

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setGate('anon');
      return;
    }
    let cancelled = false;
    adminApi
      .get('/auth/me')
      .then(() => {
        if (!cancelled) setGate('ok');
      })
      .catch(() => {
        if (!cancelled) setGate('anon');
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (gate === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm">Checking admin session…</p>
      </div>
    );
  }

  if (gate === 'anon') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
