import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';

export function TopBar({ user, onSignOut }) {
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
      <div className="flex items-center gap-3">
        {user?.email && (
          <span className="hidden max-w-[200px] truncate text-xs text-slate-500 sm:inline">
            {user.email}
          </span>
        )}
        <Button variant="secondary" className="!py-1.5 !text-xs" onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
