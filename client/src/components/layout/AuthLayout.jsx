import { Link } from 'react-router-dom';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-blue-600">
          Email Signature Builder
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {title && (
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
