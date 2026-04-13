import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-slate-50 px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">404</p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Page not found</h1>
      <p className="max-w-md text-sm text-slate-600">
        That URL does not exist or was moved. Head back to your dashboard or the home page.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-xl bg-[var(--sb-color-accent,#2563eb)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
        >
          Dashboard
        </Link>
        <Link to="/" className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
          Home
        </Link>
      </div>
    </div>
  );
}
