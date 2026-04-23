import { useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { ErrorBoundary } from './components/layout/ErrorBoundary.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { RegistrationRedeemBootstrap } from './components/RegistrationRedeemBootstrap.jsx';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute.jsx';
import { AdminLayout } from './components/admin/AdminLayout.jsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.jsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { AdminRegistrationLinksPage } from './pages/admin/AdminRegistrationLinksPage.jsx';
import { AdminAccountPage } from './pages/admin/AdminAccountPage.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { SignupPage } from './pages/SignupPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { TemplateGalleryPage } from './pages/TemplateGalleryPage.jsx';
import { EditorPage } from './pages/EditorPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { PricingPage } from './pages/PricingPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { AgencySetupPage } from './pages/AgencySetupPage.jsx';
import { AgencyJoinPage } from './pages/AgencyJoinPage.jsx';
import { AgencyDashboardPage } from './pages/AgencyDashboardPage.jsx';
import { AdminAgencyPage } from './pages/admin/AdminAgencyPage.jsx';
import { UpgradeModal } from './components/ui/UpgradeModal.jsx';

function EB({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

function EditorSecondCtaRedirect() {
  const { id } = useParams();
  return <Navigate to={`/editor/${id}/banners`} replace />;
}

export default function App() {
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  return (
    <>
      <Routes>
      <Route path="/" element={<EB><LandingPage /></EB>} />
      <Route path="/login" element={<EB><LoginPage /></EB>} />
      <Route path="/signup" element={<EB><SignupPage /></EB>} />
      <Route path="/pricing" element={<EB><PricingPage /></EB>} />
      <Route path="/agency-setup" element={<EB><AgencySetupPage /></EB>} />
      <Route path="/join" element={<EB><AgencyJoinPage /></EB>} />

      <Route path="/admin/login" element={<EB><AdminLoginPage /></EB>} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EB><AdminDashboardPage /></EB>} />
          <Route path="registration-links" element={<EB><AdminRegistrationLinksPage /></EB>} />
          <Route path="agency" element={<EB><AdminAgencyPage /></EB>} />
          <Route path="console-users" element={<Navigate to="/admin/agency" replace />} />
          <Route path="account" element={<EB><AdminAccountPage /></EB>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<EB><DashboardPage /></EB>} />
        <Route path="/intro-templates" element={<EB><TemplateGalleryPage /></EB>} />
        <Route path="/editor/:id" element={<EB><EditorPage /></EB>} />
        <Route path="/editor/:id/palettes" element={<EB><EditorPage /></EB>} />
        <Route path="/editor/:id/layouts" element={<EB><EditorPage /></EB>} />
        <Route path="/editor/:id/banners" element={<EB><EditorPage /></EB>} />
        <Route path="/editor/:id/second-cta" element={<EB><EditorSecondCtaRedirect /></EB>} />
        <Route path="/settings" element={<EB><SettingsPage /></EB>} />
        <Route path="/agency/links" element={<Navigate to="/agency?tab=links" replace />} />
        <Route path="/agency/members" element={<Navigate to="/agency?tab=members" replace />} />
        <Route path="/agency" element={<EB><AgencyDashboardPage /></EB>} />
      </Route>

      <Route path="*" element={<EB><NotFoundPage /></EB>} />
      </Routes>
      <RegistrationRedeemBootstrap />
      <UpgradeModal />
    </>
  );
}
