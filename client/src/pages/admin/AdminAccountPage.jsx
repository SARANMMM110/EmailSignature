import { useEffect, useState } from 'react';
import { FiShield, FiKey, FiSave } from 'react-icons/fi';
import { adminApi, setAdminToken } from '../../lib/adminApi.js';

export function AdminAccountPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .get('/auth/me')
      .then(({ data }) => {
        setUsername(data?.username || '');
        setNewUsername(data?.username || '');
        setDisplayName(data?.display_name || '');
      })
      .catch(() => setError('Could not load account.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    const nu = newUsername.trim();
    const payload = {
      current_password: currentPassword,
      ...(nu && nu !== username ? { new_username: nu } : {}),
      ...(newPassword ? { new_password: newPassword } : {}),
    };
    if (!payload.new_username && !payload.new_password) {
      setError('Enter a new username and/or new password to save changes.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await adminApi.patch('/auth/credentials', payload);
      if (data?.token) {
        setAdminToken(data.token);
      }
      setUsername(data.username);
      setNewUsername(data.username);
      if (data.display_name != null) setDisplayName(data.display_name);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Saved. Your session stays active; use the new credentials next time you sign in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 lg:p-12">
      <div className="mx-auto max-w-lg">
        <div className="inline-flex rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 p-3 ring-1 ring-indigo-200/50">
          <FiShield className="h-7 w-7 text-indigo-700" aria-hidden />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">Admin account</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Update the credentials for this admin console. Your current password is required for any change.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm shadow-slate-200/40"
        >
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
              {message}
            </div>
          ) : null}

          {displayName ? (
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Display name
              </label>
              <p className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-800">
                {displayName}
              </p>
              <p className="mt-1.5 text-xs text-slate-500">Shown on agency tier links you create. Contact support to change it.</p>
            </div>
          ) : null}

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <FiKey className="h-3.5 w-3.5" aria-hidden />
              Current password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">New password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1.5 text-xs text-slate-500">Minimum 8 characters if you change it.</p>
          </div>

          <div>
            <label className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Confirm new password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" aria-hidden />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
