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
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const signupWithEmail = useAuthStore((s) => s.signupWithEmail);
  const storeLogout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const logout = useCallback(async () => {
    await storeLogout();
    navigate('/login', { replace: true });
  }, [navigate, storeLogout]);

  return {
    user,
    profile,
    session,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    signOut: logout,
    updateProfile,
  };
}
