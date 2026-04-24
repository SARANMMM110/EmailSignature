import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

/**
 * Auth state and actions. Call `initialize()` once from `App` on boot (see App.jsx).
 */
export function useAuth() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const agencyInfo = useAuthStore((s) => s.agencyInfo);
  const isAgencyOwner = useAuthStore((s) => s.isAgencyOwner);
  const isAgencyMember = useAuthStore((s) => s.isAgencyMember);
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const signupWithEmail = useAuthStore((s) => s.signupWithEmail);
  const changePassword = useAuthStore((s) => s.changePassword);
  const storeLogout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const logout = useCallback(async () => {
    try {
      await storeLogout();
    } finally {
      navigate('/login', { replace: true });
    }
  }, [navigate, storeLogout]);

  return {
    user,
    profile,
    agencyInfo,
    isAgencyOwner,
    isAgencyMember,
    session,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    changePassword,
    logout,
    signOut: logout,
    updateProfile,
  };
}
