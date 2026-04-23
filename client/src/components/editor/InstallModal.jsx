import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';
import { ManualHtmlCopyModal } from '../ui/ManualHtmlCopyModal.jsx';
import {
  buildSignaturePasteHtml,
  buildStackedSignatureBannerPasteHtml,
  copySignatureImageToClipboard,
  copySignaturePasteHtml,
} from '../../lib/clipboardHelper.js';
import { useEditorStore } from '../../store/editorStore.js';
import { formatInstallGuide } from '../../content/installClientGuides.js';
import { usePlanGate } from '../../hooks/usePlanGate.js';
import { useUpgradeModalStore } from '../../store/upgradeModalStore.js';
import { BRAND_NAME } from '../../constants/brand.js';
import { PLANS } from '../../data/plans.js';

const BRAND = BRAND_NAME;

const CLIENTS = [
  { id: 'gmail', name: 'Gmail' },
  { id: 'outlook', name: 'Outlook' },
  { id: 'yahoo', name: 'Yahoo' },
  { id: 'apple', name: 'Mail (macOS)' },
  { id: 'spark', name: 'Spark' },
];

function IconGmail() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.428-3.122 4-1.545L12 10.09l7.045-5.178C20.572 2.335 24 3.434 24 5.457z" />
    </svg>
  );
}

function IconOutlook() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
      <path fill="#0078D4" d="M7.5 21H2V3h5.5v18zm2.25-18v18H22V3H9.75zm6.375 4.5h3.375L16.5 12l3 4.5h-3.375L13.5 12l2.625-4.5z" />
    </svg>
  );
}

function IconYahoo() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#6001D2"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm5 0h-2v-3.5c0-1.1-.9-2-2-2s-2 .9-2 2V17H8v-6h2v.8c.6-1 1.7-1.8 3-1.8 2.2 0 4 1.8 4 4V17z"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg className="h-6 w-6 text-teal-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

const ICONS = {
  gmail: IconGmail,
  outlook: IconOutlook,
  yahoo: IconYahoo,
  apple: IconMail,
  spark: IconSpark,
};

function IconClipboardCheck({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function IconHome({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

export function InstallModal({ open, onClose, onToast }) {
  const navigate = useNavigate();
  const gate = usePlanGate();
  const showUpgradeModal = useUpgradeModalStore((s) => s.showUpgradeModal);
  const [active, setActive] = useState('gmail');
  const [copyingImage, setCopyingImage] = useState(false);
  const [copyingHtml, setCopyingHtml] = useState(false);
  const [copiedKind, setCopiedKind] = useState(null);
  const [manualCopyOpen, setManualCopyOpen] = useState(false);
  const [manualCopyHtml, setManualCopyHtml] = useState('');

  const exportImageUrl = useEditorStore((s) => s.exportImageUrl);
  const exportBannerImageUrl = useEditorStore((s) => s.exportBannerImageUrl);
  const exportBannerSlotImageUrls = useEditorStore((s) => s.exportBannerSlotImageUrls);
  const exportGenerating = useEditorStore((s) => s.exportGenerating);
  const exportImageError = useEditorStore((s) => s.exportImageError);
  const refreshExportImage = useEditorStore((s) => s.refreshExportImage);
  const generatedHTML = useEditorStore((s) => s.generatedHTML);
  const signatureLink = useEditorStore((s) => String(s.signature?.signature_link || '').trim());
  const bannerLink = useEditorStore((s) =>
    String(s.signature?.banner_config?.link_url || s.signature?.banner_config?.href || '').trim()
  );
  const secondaryBannerLink = useEditorStore((s) =>
    String(s.signature?.banner_config?.secondary_link_url || s.signature?.banner_config?.secondary_href || '').trim()
  );

  const bannerSlotExportUrls = useMemo(() => {
    const xs = Array.isArray(exportBannerSlotImageUrls) ? exportBannerSlotImageUrls : [];
    if (xs.length > 0) return xs.map((u) => String(u || '').trim()).filter(Boolean);
    const one = String(exportBannerImageUrl || '').trim();
    return one ? [one] : [];
  }, [exportBannerImageUrl, exportBannerSlotImageUrls]);

  const client = CLIENTS.find((c) => c.id === active) || CLIENTS[0];
  const guideText = formatInstallGuide(active, BRAND);

  const resolveExportUrl = async () => {
    let url = String(exportImageUrl || '').trim();
    if (!url) {
      await refreshExportImage();
      url = String(useEditorStore.getState().exportImageUrl || '').trim();
    }
    if (!url) {
      const err = useEditorStore.getState().exportImageError || 'Signature image is not ready.';
      throw new Error(err);
    }
    return url;
  };

  const handleCopyImage = async () => {
    if (!gate.can('png_rich_clipboard_render')) {
      showUpgradeModal({
        feature: 'png_rich_clipboard_render',
        title: `PNG Clipboard — ${PLANS.advanced.name} feature`,
        message: 'Copy your signature as a high-quality PNG image directly to clipboard.',
      });
      return;
    }
    setCopyingImage(true);
    try {
      const url = await resolveExportUrl();
      const slotUrls = (() => {
        const st = useEditorStore.getState();
        const xs = Array.isArray(st.exportBannerSlotImageUrls) ? st.exportBannerSlotImageUrls : [];
        if (xs.length > 0) return xs.map((u) => String(u || '').trim()).filter(Boolean);
        const one = String(st.exportBannerImageUrl || '').trim();
        return one ? [one] : [];
      })();
      const frag = String(generatedHTML || '').trim();
      const bannerSlotPairs = slotUrls.map((imageUrl, idx) => ({
        imageUrl,
        linkUrl: idx === 0 ? bannerLink : secondaryBannerLink,
      }));
      const clip = await copySignatureImageToClipboard(url, {
        signatureLinkUrl: signatureLink,
        ...(slotUrls.length
          ? { bannerSlotPairs }
          : {}),
        ...(frag ? { fragmentHtml: frag } : {}),
      });
      onToast?.(
        clip?.mode === 'image'
          ? 'Signature copied as image — paste into your mail app.'
          : `Copied for ${client.name}. Paste with Ctrl+V / Cmd+V — images load from your hosted URLs.`,
        'success'
      );
      setCopiedKind('image');
      setTimeout(() => setCopiedKind(null), 2200);
    } catch (e) {
      onToast?.(e?.message || 'Could not copy image.', 'error');
    } finally {
      setCopyingImage(false);
    }
  };

  const handleCopyHtml = async () => {
    setCopyingHtml(true);
    try {
      let sigUrl = String(exportImageUrl || '').trim();
      if (!sigUrl) {
        await refreshExportImage();
        sigUrl = String(useEditorStore.getState().exportImageUrl || '').trim();
      }
      if (!sigUrl) {
        throw new Error(useEditorStore.getState().exportImageError || 'Signature image is not ready.');
      }
      const slotUrls = bannerSlotExportUrls;
      const frag = String(generatedHTML || '').trim();
      try {
        if (sigUrl && slotUrls.length > 0) {
          const [firstBan, ...restBan] = slotUrls;
          await copySignaturePasteHtml(
            sigUrl,
            signatureLink,
            '',
            firstBan,
            bannerLink,
            restBan.length
              ? restBan.map((u, idx) => ({
                  imageUrl: u,
                  linkUrl: idx === 0 ? secondaryBannerLink : '',
                }))
              : undefined
          );
        } else if (frag) {
          await copySignaturePasteHtml('', signatureLink, frag, '', '');
        } else {
          await copySignaturePasteHtml(sigUrl, signatureLink, '', '', '');
        }
      } catch (clipErr) {
        const pasteBlocks =
          sigUrl && slotUrls.length > 0
            ? [
                { imageUrl: sigUrl, linkUrl: signatureLink },
                ...slotUrls.map((u, idx) => ({
                  imageUrl: u,
                  linkUrl: idx === 0 ? bannerLink : secondaryBannerLink,
                })),
              ]
            : null;
        const manual = pasteBlocks
          ? buildStackedSignatureBannerPasteHtml(pasteBlocks)
          : frag || buildSignaturePasteHtml(sigUrl, signatureLink);
        setManualCopyHtml(manual);
        setManualCopyOpen(true);
        onToast?.(clipErr?.message || 'Select the HTML in the dialog and copy manually.', 'success');
        return;
      }
      onToast?.('HTML Copied', 'success');
      setCopiedKind('html');
      setTimeout(() => setCopiedKind(null), 2200);
    } catch (e) {
      onToast?.(e?.message || 'Could not copy HTML.', 'error');
    } finally {
      setCopyingHtml(false);
    }
  };

  const handleMySignatures = () => {
    onClose?.();
    navigate('/dashboard');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-stretch justify-center p-0 sm:p-4 md:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button type="button" className="absolute inset-0 bg-slate-900/60" aria-label="Close" onClick={onClose} />
      <div className="relative flex h-full max-h-none w-full max-w-none flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200 sm:max-h-[92vh] sm:rounded-2xl md:max-w-5xl">
        <button
          type="button"
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="w-full shrink-0 border-b border-slate-200 bg-slate-50 md:w-[240px] md:border-b-0 md:border-r">
            <h3 className="border-b border-slate-200 px-4 py-3 text-xs font-bold tracking-wider text-slate-500">
              EMAIL CLIENTS
            </h3>
            <nav className="p-2">
              {CLIENTS.map((c) => {
                const Icon = ICONS[c.id] || IconMail;
                const sel = active === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActive(c.id)}
                    className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                      sel
                        ? 'border-l-4 border-[#3b5bdb] bg-white text-[#3b5bdb] shadow-sm'
                        : 'border-l-4 border-transparent text-slate-700 hover:bg-white/80'
                    }`}
                  >
                    <Icon />
                    {c.name}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              Add your {BRAND} signature in {client.name}
            </h2>

            <div className="relative mt-6 flex aspect-video max-h-56 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-200 via-pink-100 to-indigo-100">
              <button
                type="button"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#3b5bdb] shadow-lg transition hover:scale-105"
                aria-label="Play video (placeholder)"
              >
                <svg className="ml-1 h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <p className="absolute bottom-3 text-xs font-medium text-slate-600">Video tutorial (coming soon)</p>
            </div>

            {signatureLink ? (
              <p className="mt-6 rounded-lg border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-slate-800">
                <span className="font-semibold text-blue-900">Link on signature: </span>
                Copy to clipboard uses rich HTML (hosted images) so the pasted signature stays clickable
                without duplicating blocks in Gmail or Outlook. For the raw HTML string only, use{' '}
                <strong>Copy HTML code</strong>.
              </p>
            ) : null}

            <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-700">{guideText}</div>
            {exportGenerating && (
              <p className="mt-3 text-xs text-amber-800">Rendering signature image on server…</p>
            )}
            {exportImageError && !exportGenerating && (
              <p className="mt-3 text-xs text-red-600">Export: {exportImageError}</p>
            )}
          </main>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Button
            variant="secondary"
            type="button"
            onClick={handleMySignatures}
            className="inline-flex items-center justify-center gap-2 sm:mr-auto"
          >
            <IconHome />
            My signatures
          </Button>
          <Button
            variant="secondary"
            type="button"
            title="Copies the table+img HTML string only (writeText). Does not copy an image."
            className="inline-flex !min-w-[168px] items-center justify-center gap-2"
            disabled={copyingImage || copyingHtml || exportGenerating}
            onClick={handleCopyHtml}
          >
            {copiedKind === 'html' ? 'HTML copied!' : copyingHtml ? 'Preparing…' : 'Copy HTML code'}
          </Button>
          <Button
            type="button"
            title="Copies rich HTML for paste (hosted PNG URLs). Image-only fallback when no HTML is available."
            className={`inline-flex !min-w-[200px] items-center justify-center gap-2 !bg-[#3b5bdb] hover:!bg-[#324fcc] ${copiedKind === 'image' ? '!bg-emerald-600 hover:!bg-emerald-600' : ''}`}
            disabled={copyingImage || copyingHtml || exportGenerating}
            onClick={handleCopyImage}
          >
            <IconClipboardCheck className="h-5 w-5 shrink-0 text-white" />
            {!gate.can('png_rich_clipboard_render') ? (
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900">
                Adv+
              </span>
            ) : null}
            {copiedKind === 'image' ? 'Copied!' : copyingImage ? 'Preparing…' : 'Copy to clipboard'}
          </Button>
        </footer>
      </div>

      <ManualHtmlCopyModal
        open={manualCopyOpen}
        html={manualCopyHtml}
        onClose={() => setManualCopyOpen(false)}
        title="Copy HTML code manually"
      />
    </div>
  );
}
