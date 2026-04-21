import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { SignatureGrid } from '../components/dashboard/SignatureGrid.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { SupportFab } from '../components/ui/SupportFab.jsx';
import { useToast } from '../hooks/useToast.js';
import { useAuth } from '../hooks/useAuth.js';
import { useI18n } from '../hooks/useI18n.js';
import { signaturesAPI } from '../lib/api.js';
import { usePlanGate } from '../hooks/usePlanGate.js';
import { useUpgradeModalStore } from '../store/upgradeModalStore.js';

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/90 shadow-sm"
        >
          <div className="px-4 pb-2 pt-4">
            <div className="h-4 w-2/3 rounded-md bg-slate-200/90" />
            <div className="mt-2 h-3 w-24 rounded bg-slate-200/70" />
          </div>
          <div className="mx-3 mb-3 h-[236px] rounded-xl border border-slate-200/80 bg-white" />
          <div className="flex gap-3 border-t border-slate-200/80 px-4 py-3.5">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-28 rounded bg-slate-200" />
              <div className="h-2 w-36 rounded bg-slate-200/70" />
            </div>
            <div className="flex gap-1.5 pt-2">
              <div className="h-5 w-5 rounded border border-white bg-slate-200" />
              <div className="h-5 w-5 rounded border border-white bg-slate-200" />
              <div className="h-5 w-5 rounded border border-white bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyStateIllustration() {
  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
      <div
        className="absolute inset-0 rounded-3xl opacity-90 blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgb(37 99 235 / 0.25), rgb(99 102 241 / 0.2))',
        }}
      />
      <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-3xl border border-white/80 bg-white/90 shadow-card backdrop-blur-sm">
        <svg
          className="h-20 w-20 text-blue-500/80"
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden
        >
          <rect x="20" y="40" width="80" height="56" rx="10" stroke="currentColor" strokeWidth="2.2" />
          <path
            d="M20 48 L60 78 L100 48"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="60" cy="58" r="10" fill="currentColor" opacity="0.2" />
        </svg>
      </div>
    </div>
  );
}

function IconPlusLarge() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const gate = usePlanGate();
  const showUpgradeModal = useUpgradeModalStore((s) => s.showUpgradeModal);
  const { user, profile, session, loading: authLoading } = useAuth();
  const { toast, showToast, dismiss } = useToast();
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const fetchGenRef = useRef(0);

  const sessionUserId = session?.user?.id ?? null;

  useEffect(() => {
    if (authLoading) return;
    if (!sessionUserId) {
      setLoading(false);
      setSignatures([]);
      return;
    }
    const gen = ++fetchGenRef.current;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const { data } = await signaturesAPI.getAll();
        if (gen !== fetchGenRef.current) return;
        setSignatures(data?.signatures || []);
      } catch (e) {
        if (gen !== fetchGenRef.current) return;
        setLoadError(e.response?.data?.message || e.message || t('dashboard.loadFailed'));
      } finally {
        if (gen === fetchGenRef.current) setLoading(false);
      }
    })();
  }, [sessionUserId, authLoading, t]);

  const onDeleted = useCallback((id) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const onRenamed = useCallback((updated) => {
    setSignatures((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
  }, []);

  const onDuplicated = useCallback((copy) => {
    setSignatures((prev) => [copy, ...prev]);
  }, []);

  const tryCreateSignature = useCallback(() => {
    if (gate.isAtLimit('max_active_signatures', signatures.length)) {
      const needUlt = gate.planId === 'advanced';
      showUpgradeModal({
        feature: 'max_active_signatures',
        requiredPlan: needUlt ? 'ultimate' : 'advanced',
        message: `Your ${gate.plan.name} plan includes up to ${gate.limitText('max_active_signatures')} active signatures.`,
      });
      return;
    }
    navigate('/intro-templates');
  }, [gate, navigate, showUpgradeModal, signatures.length]);

  const showContent = !authLoading && Boolean(session);

  const primaryCtaClass =
    'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/35 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-white">
      <Sidebar />

      <div className="app-canvas app-grid-noise relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <header className="flex shrink-0 flex-col gap-6 px-6 pb-2 pt-8 md:flex-row md:items-end md:justify-between md:px-10 md:pt-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0c1929] md:text-4xl">
              {t('dashboard.title')}
            </h1>
            <p className="mt-2 max-w-xl text-base font-medium text-slate-500">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className="shrink-0 md:pb-1">
            <button
              type="button"
              onClick={tryCreateSignature}
              className={primaryCtaClass}
              style={{ background: 'linear-gradient(135deg, #3b5fff, #2563eb)' }}
            >
              <IconPlusLarge />
              {t('dashboard.createSignature')}
            </button>
          </div>
        </header>

        {gate.planId !== 'ultimate' && signatures.length > 0 ? (
          <div className="flex items-center gap-2 px-6 pb-2 md:px-10">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (signatures.length / Math.max(1, Number(gate.limit('max_active_signatures')) || 1)) * 100)}%`,
                  background:
                    signatures.length >= gate.limit('max_active_signatures') ? '#dc2626' : '#2563eb',
                }}
              />
            </div>
            <span className="whitespace-nowrap text-xs font-medium text-slate-500">
              {signatures.length} / {gate.limitText('max_active_signatures')} signatures
            </span>
            {signatures.length >= gate.limit('max_active_signatures') ? (
              <button
                type="button"
                className="whitespace-nowrap text-[11px] font-bold text-[#2563eb] hover:underline"
                onClick={() => navigate('/settings#plan')}
              >
                Upgrade →
              </button>
            ) : null}
          </div>
        ) : null}

        <main className="flex-1 px-6 pb-16 pt-2 md:px-10">
          {loadError && (
            <p className="mb-8 rounded-2xl border border-red-200/80 bg-red-50/90 px-5 py-4 text-sm font-medium text-red-800 shadow-sm backdrop-blur-sm">
              {loadError}
            </p>
          )}

          {!showContent || loading ? (
            <DashboardSkeleton />
          ) : signatures.length === 0 ? (
            <div className="mx-auto mt-4 flex max-w-lg flex-col items-center rounded-3xl border border-slate-200/80 bg-white/80 px-10 py-16 text-center shadow-card backdrop-blur-md">
              <EmptyStateIllustration />
              <h2 className="mt-8 text-2xl font-extrabold text-[#0c1929]">{t('dashboard.emptyTitle')}</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
                {t('dashboard.emptyBody')}
              </p>
              <button
                type="button"
                onClick={tryCreateSignature}
                className={`${primaryCtaClass} mt-10`}
                style={{ background: 'linear-gradient(135deg, #3b5fff, #2563eb)' }}
              >
                <IconPlusLarge />
                {t('dashboard.createSignature')}
              </button>
            </div>
          ) : (
            <SignatureGrid
              signatures={signatures}
              showToast={showToast}
              onDeleted={onDeleted}
              onRenamed={onRenamed}
              onDuplicated={onDuplicated}
            />
          )}
        </main>
      </div>

      <SupportFab />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={dismiss}
          duration={3000}
        />
      )}
    </div>
  );
}
