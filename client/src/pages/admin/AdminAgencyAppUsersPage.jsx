import { useCallback, useEffect, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { adminApi } from '../../lib/adminApi.js';
import { PLANS } from '../../data/plans.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatWhen } from './agencyAdminUtils.js';

const DEFAULT_PLAN = PLANS.advanced;

export function AdminAgencyAppUsersPage() {
  const [appUsers, setAppUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserEmail, setAddUserEmail] = useState('');
  const [addUserUsername, setAddUserUsername] = useState('');
  const [addUserPassword, setAddUserPassword] = useState('');
  const [addUserSubmitting, setAddUserSubmitting] = useState(false);
  const [addUserFormError, setAddUserFormError] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 3200);
  };

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { data: appData } = await adminApi.get('/app-users');
      setAppUsers(Array.isArray(appData?.users) ? appData.users : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load app users.');
      setAppUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAddUser = () => {
    setAddUserFormError('');
    setAddUserEmail('');
    setAddUserUsername('');
    setAddUserPassword('');
    setAddUserOpen(true);
  };

  const submitAddUser = async (e) => {
    e.preventDefault();
    setAddUserFormError('');
    setAddUserSubmitting(true);
    try {
      await adminApi.post('/app-users', {
        email: addUserEmail.trim(),
        username: addUserUsername.trim(),
        password: addUserPassword,
      });
      setAddUserOpen(false);
      setAddUserEmail('');
      setAddUserUsername('');
      setAddUserPassword('');
      showToast(`User created with ${DEFAULT_PLAN.name} plan`);
      try {
        const { data: appData } = await adminApi.get('/app-users');
        setAppUsers(Array.isArray(appData?.users) ? appData.users : []);
      } catch {
        /* user created; list will refresh on next page load */
      }
    } catch (err) {
      setAddUserFormError(err.response?.data?.message || err.message || 'Could not create user.');
    } finally {
      setAddUserSubmitting(false);
    }
  };

  const setAppUserDisabled = async (userId, is_disabled) => {
    try {
      await adminApi.patch(`/app-users/${encodeURIComponent(userId)}`, { is_disabled });
      showToast(is_disabled ? 'User disabled (cannot sign in)' : 'User enabled');
      const { data: appData } = await adminApi.get('/app-users');
      setAppUsers(Array.isArray(appData?.users) ? appData.users : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Update failed');
    }
  };

  const removeAppUser = async (userId) => {
    if (
      !window.confirm(
        'Permanently delete this user account and their app data? This cannot be undone.'
      )
    ) {
      return;
    }
    try {
      await adminApi.delete(`/app-users/${encodeURIComponent(userId)}`);
      showToast('User removed');
      const { data: appData } = await adminApi.get('/app-users');
      setAppUsers(Array.isArray(appData?.users) ? appData.users : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Remove failed');
    }
  };

  return (
    <>
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-800">Provisioned app users</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Create main-app accounts with email confirmed. New users are assigned the{' '}
          <strong className="font-semibold text-slate-800">{DEFAULT_PLAN.name}</strong> plan by default.{' '}
          <strong className="font-semibold text-slate-800">Disable</strong> blocks sign-in;{' '}
          <strong className="font-semibold text-slate-800">Remove</strong> deletes the account and related data.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      ) : null}

      {toast ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900">
          {toast}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" onClick={openAddUser} className="inline-flex items-center gap-2">
              <FiUserPlus className="h-4 w-4" aria-hidden />
              Add user
            </Button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 pl-5">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-slate-500">
                      No app users yet. Use <strong className="text-slate-700">Add user</strong> to provision an account (
                      {DEFAULT_PLAN.name}).
                    </td>
                  </tr>
                ) : (
                  appUsers.map((u) => {
                    const disabled = Boolean(u.is_disabled);
                    return (
                      <tr key={u.id || u.user_id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3 pl-5 font-semibold text-slate-800">{u.full_name || '—'}</td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">{u.email || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-900">
                            {DEFAULT_PLAN.name}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatWhen(u.created_at)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              disabled ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {disabled ? 'Disabled' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 pr-5 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void setAppUserDisabled(u.user_id, !disabled)}
                              className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline"
                            >
                              {disabled ? 'Enable' : 'Disable'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void removeAppUser(u.user_id)}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        title="Add app user"
        tone="dark"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAddUserOpen(false)}
              className="order-1 !border-slate-400 !bg-slate-100 !text-slate-900 shadow-sm hover:!bg-white hover:!text-slate-900 focus:ring-slate-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="admin-add-app-user-form"
              disabled={addUserSubmitting}
              className="order-2 bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500"
            >
              {addUserSubmitting ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        }
      >
        <form id="admin-add-app-user-form" onSubmit={submitAddUser} className="space-y-5 text-slate-200">
          {addUserFormError ? (
            <p className="rounded-lg border border-red-400/40 bg-red-950/50 px-3 py-2 text-sm text-red-200">{addUserFormError}</p>
          ) : null}
          <p className="text-sm text-slate-400">
            Creates a main-app account with email confirmed. Plan is set to <strong className="text-slate-100">{DEFAULT_PLAN.name}</strong>{' '}
            (Silver tier) automatically.
          </p>
          <div>
            <label htmlFor="add-user-email" className="mb-1.5 block text-sm font-medium text-slate-200">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              id="add-user-email"
              type="email"
              autoComplete="off"
              value={addUserEmail}
              onChange={(e) => setAddUserEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label htmlFor="add-user-username" className="mb-1.5 block text-sm font-medium text-slate-200">
              Username <span className="text-red-400">*</span>
            </label>
            <input
              id="add-user-username"
              type="text"
              autoComplete="off"
              value={addUserUsername}
              onChange={(e) => setAddUserUsername(e.target.value)}
              required
              minLength={2}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <p className="mt-1.5 text-xs text-slate-400">Stored as display name (profile full name).</p>
          </div>
          <div>
            <label htmlFor="add-user-password" className="mb-1.5 block text-sm font-medium text-slate-200">
              Password <span className="text-red-400">*</span>
            </label>
            <input
              id="add-user-password"
              type="password"
              autoComplete="new-password"
              value={addUserPassword}
              onChange={(e) => setAddUserPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <p className="mt-1.5 text-xs text-slate-400">At least 8 characters.</p>
          </div>
        </form>
      </Modal>
    </>
  );
}
