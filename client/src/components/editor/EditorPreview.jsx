import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlinePaintBrush,
  HiOutlinePencilSquare,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { Button } from '../ui/Button.jsx';
import { useEditorStore } from '../../store/editorStore.js';
import {
  editorPreviewShellMaxPx,
  wrapSignatureHtmlForIframe,
} from '../../data/templatePreviews.js';
import { splitSignatureAndBannerHtml } from '../../lib/splitSignatureBannerHtml.js';
import { bundleRailPxForSignature, isWebinarBannerPreset } from '../../lib/templateIds.js';
import { usePreviewIframeMeasure } from './usePreviewIframeMeasure.js';

/** Floor for iframe height while loading or if measurement fails. */
const PREVIEW_IFRAME_HEIGHT_FLOOR = 200;

function PreviewIconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a5060] transition hover:bg-white/90 hover:text-[#2d5be3] active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

function hashSrcDoc(s) {
  let h = 0;
  const cap = Math.min(s.length, 8000);
  for (let i = 0; i < cap; i++) h = (h * 33 + s.charCodeAt(i)) | 0;
  return `${s.length}-${h}`;
}

function PreviewIframeBlock({
  srcDoc,
  frameKey,
  minHeightFloor = PREVIEW_IFRAME_HEIGHT_FLOOR,
  lockRailPx = null,
}) {
  const { iframeRef, height, widthPx, measure } = usePreviewIframeMeasure(srcDoc, frameKey);
  const locked = lockRailPx != null && lockRailPx > 0;
  return (
    <div
      className={
        locked
          ? 'mx-auto w-full'
          : widthPx == null
            ? 'w-full max-w-[min(100%,720px)]'
            : ''
      }
      style={
        locked
          ? { maxWidth: `min(100%, ${editorPreviewShellMaxPx(lockRailPx)}px)` }
          : widthPx != null
            ? { width: `${widthPx}px`, maxWidth: '100%' }
            : undefined
      }
    >
      <iframe
        key={frameKey}
        ref={iframeRef}
        title="Preview"
        scrolling="no"
        srcDoc={srcDoc}
        onLoad={measure}
        className="block w-full bg-transparent"
        style={{
          border: 'none',
          minHeight: minHeightFloor,
          height,
          display: 'block',
          overflowX: 'hidden',
          overflowY: 'hidden',
        }}
      />
    </div>
  );
}

export function EditorPreview({ saveStatus, saving }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const generatedHTML = useEditorStore((s) => s.generatedHTML);
  const previewError = useEditorStore((s) => s.previewError);
  const refreshPreviewNow = useEditorStore((s) => s.refreshPreviewNow);
  const signature = useEditorStore((s) => s.signature);
  const setBanner = useEditorStore((s) => s.setBanner);
  const label = useEditorStore((s) => s.signature?.label || 'My signature');
  const saveSignature = useEditorStore((s) => s.saveSignature);
  const openInstallModal = useEditorStore((s) => s.openInstallModal);

  const bc = signature?.banner_config || {};
  const hasBannerConfigured = Boolean(
    signature?.banner_id || String(bc.link_url || bc.href || '').trim()
  );
  const bannerPreviewTitle = isWebinarBannerPreset(bc.preset_id, signature?.banner_id)
    ? 'Banner 1'
    : 'CTA banner';

  const base = `/editor/${id}`;
  const goInfo = () => navigate(base);
  const goInfoBanner = () => navigate(base, { state: { myInfoSubTab: 'banner' } });
  const goPalettes = () => navigate(`${base}/palettes`);
  const goLayouts = () => navigate(`${base}/layouts`);
  const goBanners = () => navigate(`${base}/banners`);

  const appBaseHref =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/`
      : '';

  const { signatureHtml, bannerHtml } = useMemo(
    () => splitSignatureAndBannerHtml(generatedHTML),
    [generatedHTML]
  );
  const hasSplitBanner = Boolean(bannerHtml);

  const previewLockRailPx = useMemo(() => bundleRailPxForSignature(signature), [signature]);

  const loadingP = '<p style="font-family:Arial,sans-serif;padding:8px;color:#94a3b8">Loading preview…</p>';
  const sigInner = hasSplitBanner ? signatureHtml || loadingP : generatedHTML || loadingP;

  const sigSrcDoc = useMemo(
    () =>
      wrapSignatureHtmlForIframe(sigInner, {
        bare: true,
        baseHref: appBaseHref,
        editorLockRailPx: previewLockRailPx,
      }),
    [sigInner, appBaseHref, previewLockRailPx]
  );
  const banSrcDoc = useMemo(
    () =>
      wrapSignatureHtmlForIframe(bannerHtml || loadingP, {
        bare: true,
        baseHref: appBaseHref,
        editorLockRailPx: previewLockRailPx,
      }),
    [bannerHtml, appBaseHref, previewLockRailPx]
  );

  const sigFrameKey = useMemo(() => hashSrcDoc(sigSrcDoc), [sigSrcDoc]);
  const banFrameKey = useMemo(() => hashSrcDoc(banSrcDoc), [banSrcDoc]);

  const onRemoveBanner = useCallback(() => {
    setBanner(null);
  }, [setBanner]);

  const saveHint =
    saving || saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? 'Save failed'
          : null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-5 sm:px-6 sm:py-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          background:
            'linear-gradient(180deg, #f8f7fc 0%, #f4f2f8 35%, #f0eef6 70%, #ebe8f2 100%)',
        }}
      >
        <div className="flex w-full max-w-[min(100%,900px)] flex-col gap-4">
          {previewError ? (
            <div
              role="alert"
              className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm"
            >
              <p className="font-semibold">Preview couldn&apos;t load</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">{previewError}</p>
              <button
                type="button"
                onClick={() => refreshPreviewNow()}
                className="mt-3 text-sm font-semibold text-[#2563eb] underline-offset-2 hover:underline"
              >
                Retry preview
              </button>
            </div>
          ) : null}
          {/* My signature — title row + preview (no extra card chrome; canvas gradient is the backdrop) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4 px-0.5">
              <div className="min-w-0 pt-0.5">
                <h2 className="text-[17px] font-semibold tracking-tight text-[#0d0f14] sm:text-lg">
                  {label}
                </h2>
                {saveHint ? <p className="mt-0.5 text-xs text-[#8b91a0]">{saveHint}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                <PreviewIconButton title="My information" onClick={goInfo}>
                  <HiOutlinePencilSquare className="h-5 w-5" aria-hidden />
                </PreviewIconButton>
                <PreviewIconButton title="Palettes" onClick={goPalettes}>
                  <HiOutlinePaintBrush className="h-5 w-5" aria-hidden />
                </PreviewIconButton>
                <PreviewIconButton title="Layouts" onClick={goLayouts}>
                  <HiOutlineArrowPath className="h-5 w-5" aria-hidden />
                </PreviewIconButton>
              </div>
            </div>
            <div className="flex min-h-[220px] w-full justify-center">
              <PreviewIframeBlock
                srcDoc={sigSrcDoc}
                frameKey={sigFrameKey}
                lockRailPx={previewLockRailPx}
              />
            </div>
          </section>

          {hasSplitBanner ? (
            <section className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4 px-0.5">
                <h3 className="pt-0.5 text-[17px] font-semibold tracking-tight text-[#0d0f14] sm:text-lg">
                  {bannerPreviewTitle}
                </h3>
                <div className="flex shrink-0 items-center gap-0.5">
                  <PreviewIconButton title="Edit banner" onClick={goInfoBanner}>
                    <HiOutlinePencilSquare className="h-5 w-5" aria-hidden />
                  </PreviewIconButton>
                  <PreviewIconButton title="Remove banner" onClick={onRemoveBanner}>
                    <HiOutlineXMark className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </PreviewIconButton>
                </div>
              </div>
              <div className="flex min-h-[120px] w-full justify-center">
                <PreviewIframeBlock
                  srcDoc={banSrcDoc}
                  frameKey={banFrameKey}
                  lockRailPx={previewLockRailPx}
                />
              </div>
            </section>
          ) : null}

          {hasSplitBanner ? null : hasBannerConfigured ? null : (
            <div className="rounded-[14px] border border-dashed border-slate-400/35 bg-transparent px-5 py-4 text-center sm:px-8 sm:py-5">
              <p className="text-sm leading-relaxed text-[#4a5060]">
                Need a CTA banner for your email signature?
              </p>
              <button
                type="button"
                onClick={goBanners}
                className="mt-2 text-sm font-semibold text-[#2d5be3] underline-offset-4 hover:underline"
              >
                Add CTA banner now →
              </button>
            </div>
          )}

          <Button
            type="button"
            className="mx-auto flex w-full max-w-[320px] items-center justify-center gap-2 !rounded-[10px] !bg-[#2d5be3] !py-3.5 !text-[15px] !font-semibold !text-white shadow-[0_4px_14px_rgba(45,91,227,0.35)] transition hover:!bg-[#2248c4] hover:-translate-y-px active:translate-y-0"
            disabled={saving}
            onClick={async () => {
              await saveSignature();
              openInstallModal();
            }}
          >
            <HiOutlineCheckCircle className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
            {saving ? 'Saving…' : 'Done editing'}
          </Button>
        </div>
      </div>
    </div>
  );
}
