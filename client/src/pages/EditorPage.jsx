import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { EditorLayout } from '../components/editor/EditorLayout.jsx';
import { InstallModal } from '../components/editor/InstallModal.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { MyInformationTab } from '../components/editor/tabs/MyInformationTab.jsx';
import { PalettesTab } from '../components/editor/tabs/PalettesTab.jsx';
import { LayoutsTab } from '../components/editor/tabs/LayoutsTab.jsx';
import { BannersTab } from '../components/editor/tabs/BannersTab.jsx';
import { useEditorStore } from '../store/editorStore.js';

function tabFromPathname(pathname) {
  if (pathname.endsWith('/palettes')) return 'palettes';
  if (pathname.endsWith('/layouts')) return 'layouts';
  if (pathname.endsWith('/banners')) return 'banners';
  return 'info';
}

export function EditorPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const loadSignature = useEditorStore((s) => s.loadSignature);
  const resetEditor = useEditorStore((s) => s.resetEditor);
  const saveSignature = useEditorStore((s) => s.saveSignature);
  const openInstallModal = useEditorStore((s) => s.openInstallModal);
  const showInstallModal = useEditorStore((s) => s.showInstallModal);
  const closeInstallModal = useEditorStore((s) => s.closeInstallModal);
  const isLoading = useEditorStore((s) => s.isLoading);
  const signature = useEditorStore((s) => s.signature);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const saveSignatureOnly = useEditorStore((s) => s.saveSignature);
  const [toast, setToast] = useState(null);

  const sidebarTab = useMemo(() => tabFromPathname(location.pathname), [location.pathname]);
  const editorBase = `/editor/${id}`;

  useEffect(() => {
    if (!id || id === 'new') {
      navigate('/dashboard', { replace: true });
      return;
    }
    loadSignature(id).catch(() => navigate('/dashboard', { replace: true }));
    return () => resetEditor();
  }, [id, loadSignature, navigate, resetEditor]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== 's') return;
      e.preventDefault();
      saveSignatureOnly().then((ok) => {
        if (ok) setToast({ message: 'Saved', type: 'success' });
        else setToast({ message: 'Save failed', type: 'error' });
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saveSignatureOnly]);

  const handleDoneEditing = async () => {
    const ok = await saveSignature();
    if (ok) openInstallModal();
    else setToast({ message: 'Save failed. Fix errors and try again.', type: 'error' });
  };

  if (!id || id === 'new') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
          <p className="text-sm">Loading editor…</p>
        </div>
      </div>
    );
  }

  if (!signature) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-50 text-slate-600">
        <p className="text-sm">Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <>
      <EditorLayout
        editorBasePath={editorBase}
        onDoneEditing={handleDoneEditing}
        saving={isSaving}
        saveStatus={saveStatus}
      >
        {sidebarTab === 'info' && <MyInformationTab onToast={(m, t) => setToast({ message: m, type: t })} />}
        {sidebarTab === 'palettes' && <PalettesTab />}
        {sidebarTab === 'layouts' && <LayoutsTab />}
        {sidebarTab === 'banners' && <BannersTab />}
      </EditorLayout>

      <InstallModal
        open={showInstallModal}
        onClose={closeInstallModal}
        onToast={(m, t) => setToast({ message: m, type: t })}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} duration={4000} />
      )}
    </>
  );
}
