import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { ErrorBoundary } from './components/layout/ErrorBoundary.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { SignupPage } from './pages/SignupPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { TemplateGalleryPage } from './pages/TemplateGalleryPage.jsx';
import { EditorPage } from './pages/EditorPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

function EB({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default function App() {
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<EB><LandingPage /></EB>} />
      <Route path="/login" element={<EB><LoginPage /></EB>} />
      <Route path="/signup" element={<EB><SignupPage /></EB>} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<EB><DashboardPage /></EB>} />
        <Route path="/intro-templates" element={<EB><TemplateGalleryPage /></EB>} />
        <Route path="/editor/:id" element={<EB><EditorPage /></EB>} />
        <Route path="/editor/:id/palettes" element={<EB><EditorPage /></EB>} />
        <Route path="/editor/:id/layouts" element={<EB><EditorPage /></EB>} />
        <Route path="/editor/:id/banners" element={<EB><EditorPage /></EB>} />
        <Route path="/settings" element={<EB><SettingsPage /></EB>} />
      </Route>

      <Route path="*" element={<EB><NotFoundPage /></EB>} />
    </Routes>
  );
}
