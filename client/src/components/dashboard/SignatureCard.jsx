import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signaturesAPI, signatureExportAPI } from '../../lib/api.js';
import {
  buildDualImagePasteHtml,
  copySignatureImageToClipboard,
  copySignaturePasteHtml,
} from '../../lib/clipboardHelper.js';
import { splitSignatureAndBannerHtml } from '../../lib/splitSignatureBannerHtml.js';
import { wrapHtmlFragmentForPuppeteerExport } from '../../lib/wrapSignatureExportFragment.js';
import { Modal } from '../ui/Modal.jsx';
import { ManualHtmlCopyModal } from '../ui/ManualHtmlCopyModal.jsx';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { DEMO_SIGNATURE_DATA, wrapSignatureHtmlForIframe } from '../../data/templatePreviews.js';
import { absoluteAssetUrl } from '../../lib/absoluteAssetUrl.js';
import { bundleRailPxForSignature, isImageTemplateSignature } from '../../lib/templateIds.js';
import { useI18n } from '../../hooks/useI18n.js';

function formatDashboardDate(iso, lang) {
  if (!iso) return '—';
  const d = new Date(iso);
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Up to 4 brand swatches for the card footer (square chips). */
function pickSwatches(signature) {
  const design = signature.design || {};
  if (Array.isArray(design.colors) && design.colors.length) {
    const src = design.colors.filter(Boolean);
    const out = [];
    for (let i = 0; i < 4; i++) out.push(src[i % src.length] || '#94a3b8');
    return out;
  }
  const p = design.palette;
  if (p && typeof p === 'object') {
    const order = [p.primary, p.secondary, p.accent, p.text].filter(
      (v) => typeof v === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)
    );
    if (order.length) {
      const out = [];
      for (let i = 0; i < 4; i++) out.push(order[i % order.length]);
      return out;
    }
  }
  return ['#cbd5e1', '#94a3b8', '#e2e8f0', '#f1f5f9'];
}

function contactFromSignature(signature) {
  const f = signature.fields || {};
  const form = signature.data?.form || {};
  const demo = DEMO_SIGNATURE_DATA.fields || {};
  const fromDb = {
    fullName: String(f.full_name || f.fullName || form.fullName || '').trim(),
    email: String(f.email || form.email || '').trim(),
  };
  /**
   * Server HTML fills empty contact fields with the same demo defaults as the editor starter
   * (`mergeEditorFormWithDemoDefaults`), but `fields` in the DB can stay empty until save — keep
   * the card footer aligned with what the iframe preview actually shows.
   */
  return {
    fullName: fromDb.fullName || String(demo.full_name || '').trim() || '—',
    email: fromDb.email || String(demo.email || '').trim() || '—',
  };
}

function initials(name) {
  const s = String(name || '').trim();
  if (!s || s === '—') return '?';
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function IconCopy({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

/** Clipboard with document — “Copy to clipboard” menu item. */
function IconClipboard({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

function IconCodeHtml({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function IconDownload({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function IconDuplicate({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function IconTrash({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function safeDownloadBase(name) {
  const s = String(name || 'signature')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return s || 'signature';
}

async function downloadUrlAsFile(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}).`);
  const blob = await res.blob();
  const a = document.createElement('a');
  const href = URL.createObjectURL(blob);
  a.href = href;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

function IconPencil({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function IconDots({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function PlaceholderPreview() {
  const { t } = useI18n();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white text-slate-400">
      <svg className="h-14 w-14 opacity-45" viewBox="0 0 64 64" fill="none" aria-hidden>
        <rect x="8" y="14" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M8 18 L32 36 L56 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-xs font-medium text-slate-400">{t('card.noPreview')}</span>
    </div>
  );
}

const PREVIEW_BOX_H = 236;
const PREVIEW_IFRAME_FLOOR = 100;

/** Centered, tight-height iframe preview — same wrap as template gallery (`TemplateCard`). */
function SignaturePreviewIframe({ html, label, baseHref, previewWidthPx }) {
  const iframeRef = useRef(null);
  const [naturalH, setNaturalH] = useState(200);

  const srcDoc = useMemo(
    () =>
      wrapSignatureHtmlForIframe(html, {
        baseHref,
        galleryCard: true,
        previewWidthPx:
          typeof previewWidthPx === 'number' && previewWidthPx > 0 ? previewWidthPx : 600,
      }),
    [html, baseHref, previewWidthPx]
  );

  const measure = useCallback(() => {
    const el = iframeRef.current;
    if (!el?.contentDocument?.body) return;
    try {
      const body = el.contentDocument.body;
      const host = body.querySelector('.sig-iframe-host');
      const pad =
        (parseFloat(getComputedStyle(body).paddingTop) || 0) +
        (parseFloat(getComputedStyle(body).paddingBottom) || 0);
      const raw = host
        ? Math.ceil(pad + host.offsetHeight)
        : Math.max(body.scrollHeight, PREVIEW_IFRAME_FLOOR);
      setNaturalH(Math.max(PREVIEW_IFRAME_FLOOR, Math.min(raw, 1200)));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    const onLoad = () => measure();
    el.addEventListener('load', onLoad);
    const timers = [0, 80, 200, 500].map((ms) => setTimeout(measure, ms));
    return () => {
      el.removeEventListener('load', onLoad);
      timers.forEach(clearTimeout);
    };
  }, [srcDoc, measure]);

  const scale = naturalH > PREVIEW_BOX_H ? PREVIEW_BOX_H / naturalH : 1;
  const iframeH = naturalH;

  return (
    <div
      className="flex w-full items-center justify-center overflow-hidden bg-[#f4f5f7]"
      style={{ height: PREVIEW_BOX_H }}
    >
      <div
        className="flex h-full w-full items-center justify-center px-4 sm:px-5"
        style={{
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'center center',
        }}
      >
        <iframe
          ref={iframeRef}
          title={`Preview ${label}`}
          className="h-full w-full min-h-0 border-0 bg-transparent"
          sandbox="allow-same-origin allow-scripts"
          scrolling="no"
          srcDoc={srcDoc}
          onLoad={measure}
          style={{
            border: 'none',
            height: iframeH,
            minHeight: PREVIEW_IFRAME_FLOOR,
            display: 'block',
            overflow: 'hidden',
          }}
        />
      </div>
    </div>
  );
}

export function SignatureCard({ signature, showToast, onDeleted, onRenamed, onDuplicated }) {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [manualCopyOpen, setManualCopyOpen] = useState(false);
  const [manualCopyHtml, setManualCopyHtml] = useState('');
  const menuRef = useRef(null);

  const label = signature.label || signature.name || t('card.untitled');
  const html = signature.generated_html || signature.html;
  const previewRailPx = bundleRailPxForSignature(signature);
  const swatches = pickSwatches(signature);
  const { fullName, email } = contactFromSignature(signature);

  const appBaseHref =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/`
      : '';
  const designImgRaw = String(
    signature.design?.signatureImageUrl || signature.fields?.signature_image_url || ''
  ).trim();
  const rasterPreviewUrl =
    isImageTemplateSignature(signature) && designImgRaw ? absoluteAssetUrl(designImgRaw) : '';
  const showRasterPreview = Boolean(rasterPreviewUrl);
  const signatureLink = String(signature.signature_link || '').trim();
  const bannerLink = String(
    signature.banner_config?.link_url || signature.banner_config?.href || ''
  ).trim();

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const runCopyImageToClipboard = useCallback(async () => {
    const { data } = await signaturesAPI.copy(signature.id);
    const copyHtml = data?.html;
    if (!copyHtml?.trim()) {
      showToast(t('card.toastNoHtml'), 'error');
      return;
    }
    const { signatureHtml, bannerHtml } = splitSignatureAndBannerHtml(copyHtml);

    if (bannerHtml?.trim() && signatureHtml?.trim()) {
      const railPx = bundleRailPxForSignature(signature);
      const [sigRes, banRes] = await Promise.all([
        signatureExportAPI.generateImage(wrapHtmlFragmentForPuppeteerExport(signatureHtml, railPx)),
        signatureExportAPI.generateImage(wrapHtmlFragmentForPuppeteerExport(bannerHtml, railPx)),
      ]);
      const sigUrl = String(sigRes.data?.url || '').trim();
      const banUrl = String(banRes.data?.url || '').trim();
      const imgWarn = [sigRes.data?.recipientImageWarning, banRes.data?.recipientImageWarning]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (!sigUrl || !banUrl) {
        showToast(t('card.toastNoDualImages'), 'error');
        return;
      }
      await copySignatureImageToClipboard(sigUrl, {
        signatureLinkUrl: signatureLink,
        bannerLinkUrl: bannerLink,
        bannerImageUrl: banUrl,
      });
      showToast(t('card.toastCopiedDualBlocks'), 'success');
      if (imgWarn) setTimeout(() => showToast(imgWarn, 'error'), 500);
    } else {
      const { data: imgData } = await signatureExportAPI.generateImage(copyHtml);
      const url = String(imgData?.url || '').trim();
      if (!url) {
        showToast(t('card.toastNoSigImageUrl'), 'error');
        return;
      }
      const imgWarn = String(imgData?.recipientImageWarning || '').trim();
      await copySignatureImageToClipboard(url, { signatureLinkUrl: signatureLink });
      showToast(
        signatureLink ? t('card.toastCopiedRich') : t('card.toastCopiedImage'),
        'success'
      );
      if (imgWarn && signatureLink) {
        setTimeout(() => showToast(imgWarn, 'error'), 500);
      }
    }
  }, [bannerLink, showToast, signature, signatureLink, t]);

  const handleCopyImage = (e) => {
    e?.stopPropagation();
    if (busy) return;
    setBusy(true);
    void (async () => {
      try {
        await runCopyImageToClipboard();
      } catch (err) {
        showToast(err.response?.data?.message || err.message || t('card.toastImageCopyFailed'), 'error');
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleCopyToClipboardMenu = () => {
    setMenuOpen(false);
    if (busy) return;
    setBusy(true);
    void (async () => {
      try {
        await runCopyImageToClipboard();
      } catch (err) {
        showToast(err.response?.data?.message || err.message || t('card.toastImageCopyFailed'), 'error');
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleDownloadMenu = () => {
    setMenuOpen(false);
    if (busy) return;
    setBusy(true);
    const base = safeDownloadBase(label);
    void (async () => {
      try {
        const { data } = await signaturesAPI.copy(signature.id);
        const copyHtml = data?.html;
        if (!copyHtml?.trim()) {
          showToast(t('card.toastNoHtml'), 'error');
          return;
        }
        const { signatureHtml, bannerHtml } = splitSignatureAndBannerHtml(copyHtml);

        if (bannerHtml?.trim() && signatureHtml?.trim()) {
          const railPx = bundleRailPxForSignature(signature);
          const [sigRes, banRes] = await Promise.all([
            signatureExportAPI.generateImage(wrapHtmlFragmentForPuppeteerExport(signatureHtml, railPx)),
            signatureExportAPI.generateImage(wrapHtmlFragmentForPuppeteerExport(bannerHtml, railPx)),
          ]);
          const sigUrl = String(sigRes.data?.url || '').trim();
          const banUrl = String(banRes.data?.url || '').trim();
          if (!sigUrl || !banUrl) {
            showToast(t('card.toastNoDualImages'), 'error');
            return;
          }
          await downloadUrlAsFile(sigUrl, `${base}-signature.png`);
          await new Promise((r) => setTimeout(r, 400));
          await downloadUrlAsFile(banUrl, `${base}-banner.png`);
          showToast(t('card.toastDownloadedDual'), 'success');
        } else {
          const { data: imgData } = await signatureExportAPI.generateImage(copyHtml);
          const url = String(imgData?.url || '').trim();
          if (!url) {
            showToast(t('card.toastNoSigImageUrl'), 'error');
            return;
          }
          await downloadUrlAsFile(url, `${base}.png`);
          showToast(t('card.toastDownloadedSig'), 'success');
        }
      } catch (err) {
        showToast(err.response?.data?.message || err.message || t('card.toastDownloadFailed'), 'error');
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleEditMenu = () => {
    setMenuOpen(false);
    navigate(`/editor/${signature.id}`);
  };

  const handleCopyHtmlMenu = async () => {
    setMenuOpen(false);
    setBusy(true);
    try {
      const { data } = await signaturesAPI.copy(signature.id);
      const fullHtml = data?.html;
      if (!fullHtml?.trim()) {
        showToast(t('card.toastNoHtml'), 'error');
        return;
      }
      const { signatureHtml, bannerHtml } = splitSignatureAndBannerHtml(fullHtml);
      let manualFallback = fullHtml.trim();

      if (bannerHtml?.trim() && signatureHtml?.trim()) {
        const railPx = bundleRailPxForSignature(signature);
        const [sigRes, banRes] = await Promise.all([
          signatureExportAPI.generateImage(wrapHtmlFragmentForPuppeteerExport(signatureHtml, railPx)),
          signatureExportAPI.generateImage(wrapHtmlFragmentForPuppeteerExport(bannerHtml, railPx)),
        ]);
        const sigUrl = String(sigRes.data?.url || '').trim();
        const banUrl = String(banRes.data?.url || '').trim();
        const imgWarn = [sigRes.data?.recipientImageWarning, banRes.data?.recipientImageWarning]
          .filter(Boolean)
          .join(' ')
          .trim();
        if (sigUrl && banUrl) {
          manualFallback = buildDualImagePasteHtml(sigUrl, banUrl, {
            signatureLinkUrl: signatureLink,
            bannerLinkUrl: bannerLink,
          });
          try {
            await copySignaturePasteHtml(sigUrl, signatureLink, '', banUrl, bannerLink);
            showToast(t('card.toastCopiedGmailHtml'), 'success');
            if (imgWarn) setTimeout(() => showToast(imgWarn, 'error'), 500);
          } catch (clipErr) {
            setManualCopyHtml(manualFallback);
            setManualCopyOpen(true);
            showToast(t('card.toastCopyFromDialog'), 'success');
            if (imgWarn) setTimeout(() => showToast(imgWarn, 'error'), 500);
          }
          return;
        }
      }

      try {
        await copySignaturePasteHtml('', signatureLink, fullHtml.trim(), '', '');
        showToast(t('card.toastCopiedFullHtml'), 'success');
      } catch (clipErr) {
        setManualCopyHtml(manualFallback);
        setManualCopyOpen(true);
        showToast(t('card.toastCopyFromDialog'), 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || t('card.toastCopyFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/editor/${signature.id}`);
  };

  const openRename = () => {
    setRenameValue(label);
    setRenameOpen(true);
    setMenuOpen(false);
  };

  const submitRename = async () => {
    const next = renameValue.trim();
    if (!next) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setBusy(true);
    try {
      const { data } = await signaturesAPI.update(signature.id, { label: next });
      const updated = data?.signature || { ...signature, label: next, name: next };
      onRenamed?.(updated);
      setRenameOpen(false);
      showToast(t('card.toastRenamed'), 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || t('card.toastRenameFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicateMenu = async () => {
    setMenuOpen(false);
    setBusy(true);
    try {
      const { data } = await signaturesAPI.duplicate(signature.id);
      if (data?.signature) onDuplicated?.(data.signature);
      showToast(t('card.toastDuplicated'), 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || t('card.toastDuplicateFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm(t('card.deleteConfirm'))) return;
    setBusy(true);
    try {
      await signaturesAPI.delete(signature.id);
      onDeleted?.(signature.id);
      showToast(t('card.toastDeleted'), 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || t('card.toastDeleteFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <article className="group/card relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/90 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-md">
        <div className="px-4 pb-2 pt-4">
          <h3
            className="cursor-default truncate text-[15px] font-bold tracking-tight text-slate-900"
            title={t('card.doubleClickRename')}
            onDoubleClick={(e) => {
              e.stopPropagation();
              openRename();
            }}
          >
            {label}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {formatDashboardDate(signature.updated_at, lang)}
          </p>
        </div>

        <div className="relative mx-3 mb-3 mt-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          {showRasterPreview ? (
            <>
              <div
                className="flex w-full items-center justify-center overflow-hidden bg-[#f4f5f7]"
                style={{ height: PREVIEW_BOX_H }}
              >
                <img
                  src={rasterPreviewUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-3 bg-slate-900/0 opacity-0 backdrop-blur-[1px] transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:bg-slate-900/45 group-hover/card:opacity-100">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCopyImage}
                  className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg transition hover:scale-105 hover:bg-blue-50 disabled:opacity-50"
                  aria-label={t('card.copyImageAria')}
                >
                  <IconCopy className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleEdit}
                  className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg transition hover:scale-105 hover:bg-blue-50 disabled:opacity-50"
                  aria-label={t('card.editAria')}
                >
                  <IconPencil className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : html ? (
            <>
              <SignaturePreviewIframe
                html={html}
                label={label}
                baseHref={appBaseHref}
                previewWidthPx={previewRailPx}
              />
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-3 bg-slate-900/0 opacity-0 backdrop-blur-[1px] transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:bg-slate-900/45 group-hover/card:opacity-100">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCopyImage}
                  className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg transition hover:scale-105 hover:bg-blue-50 disabled:opacity-50"
                  aria-label={t('card.copyImageAria')}
                >
                  <IconCopy className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleEdit}
                  className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg transition hover:scale-105 hover:bg-blue-50 disabled:opacity-50"
                  aria-label={t('card.editAria')}
                >
                  <IconPencil className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex" style={{ height: PREVIEW_BOX_H }}>
              <PlaceholderPreview />
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-3 border-t border-slate-200/80 bg-slate-100/90 px-4 py-3.5">
          <div
            className="flex min-w-0 flex-1 items-center gap-3"
            title={`${fullName} · ${email}`}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md shadow-blue-500/25"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              }}
            >
              {initials(fullName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{fullName}</p>
              <p className="truncate text-xs font-medium text-slate-500">{email}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {swatches.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="h-5 w-5 shrink-0 rounded border border-white shadow-sm ring-1 ring-slate-200/70"
                style={{ backgroundColor: c }}
                title={t('card.colorN', { n: i + 1 })}
              />
            ))}
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              disabled={busy}
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-full border-2 border-sky-200/90 bg-white p-2 text-slate-500 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/80 hover:text-slate-700 disabled:opacity-50"
              aria-label={t('card.moreActionsAria')}
              aria-expanded={menuOpen}
            >
              <IconDots />
            </button>
            {menuOpen && (
              <div
                className="absolute bottom-full right-0 z-30 mb-2 min-w-[220px] overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 py-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-md"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={handleCopyToClipboardMenu}
                >
                  <IconClipboard className="h-5 w-5 shrink-0 text-slate-500" />
                  {t('card.menuCopy')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={handleCopyHtmlMenu}
                >
                  <IconCodeHtml className="h-5 w-5 shrink-0 text-slate-500" />
                  {t('card.menuCopyHtml')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={handleDownloadMenu}
                >
                  <IconDownload className="h-5 w-5 shrink-0 text-slate-500" />
                  {t('card.menuDownload')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={handleDuplicateMenu}
                >
                  <IconDuplicate className="h-5 w-5 shrink-0 text-slate-500" />
                  {t('card.menuDuplicate')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={handleEditMenu}
                >
                  <IconPencil className="h-5 w-5 shrink-0 text-slate-500" />
                  {t('card.menuEdit')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  onClick={handleDelete}
                >
                  <IconTrash className="h-5 w-5 shrink-0 text-red-500" />
                  {t('card.menuDelete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      <ManualHtmlCopyModal
        open={manualCopyOpen}
        html={manualCopyHtml}
        onClose={() => setManualCopyOpen(false)}
        title={t('card.modalCopyHtmlTitle')}
      />

      <Modal
        open={renameOpen}
        onClose={() => !busy && setRenameOpen(false)}
        title={t('card.modalRenameTitle')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setRenameOpen(false)} disabled={busy}>
              {t('card.cancel')}
            </Button>
            <Button
              type="button"
              className="!bg-[#2563eb] hover:!bg-[#1d4ed8]"
              onClick={submitRename}
              disabled={busy}
            >
              {t('card.save')}
            </Button>
          </div>
        }
      >
        <Input
          label={t('card.nameLabel')}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && submitRename()}
        />
      </Modal>
    </>
  );
}
