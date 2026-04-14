import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineCheckCircle,
  HiOutlineDocumentDuplicate,
  HiOutlinePencilSquare,
  HiOutlineSwatch,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { Button } from '../ui/Button.jsx';
import { useEditorStore } from '../../store/editorStore.js';
import {
  editorPreviewShellMaxPx,
  wrapSignatureHtmlForIframe,
} from '../../data/templatePreviews.js';
import { splitSignatureAndBannerHtml } from '../../lib/splitSignatureBannerHtml.js';
import { bundleRailPxForSignature } from '../../lib/templateIds.js';
import { usePreviewIframeMeasure } from './usePreviewIframeMeasure.js';

/** Floor for iframe height while loading or if measurement fails. */
const PREVIEW_IFRAME_HEIGHT_FLOOR = 200;
/** Signature preview needs a taller floor so the card is not clipped before measure runs. */
const SIG_PREVIEW_IFRAME_MIN_H = 320;
const PREVIEW_LOADING_P =
  '<p style="font-family:Arial,sans-serif;padding:8px;color:#94a3b8">Loading preview…</p>';

function PreviewIconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800 active:scale-[0.98] sm:h-10 sm:w-10"
    >
      {children}
    </button>
  );
}

function PreviewDeleteButton({ title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="relative z-20 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-800 active:scale-[0.98] sm:h-10 sm:w-10"
    >
      <HiOutlineXMark className="h-5 w-5" strokeWidth={2} aria-hidden />
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
            ? 'w-full max-w-[min(100%,min(1100px,96vw))]'
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

export function EditorPreview({
  saveStatus,
  saving,
  onDoneEditing,
  doneEditingLabel = 'Done editing',
  savingLabel = 'Saving…',
}) {
  const navigate = useNavigate();
  const { id } = useParams();

  const generatedHTML = useEditorStore((s) => s.generatedHTML);
  const previewError = useEditorStore((s) => s.previewError);
  const refreshPreviewNow = useEditorStore((s) => s.refreshPreviewNow);
  const signature = useEditorStore((s) => s.signature);
  const setBanner = useEditorStore((s) => s.setBanner);
  const setSecondaryBanner = useEditorStore((s) => s.setSecondaryBanner);

  const bc = signature?.banner_config || {};
  const hasBannerConfigured = Boolean(
    signature?.banner_id || String(bc.link_url || bc.href || '').trim()
  );
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

  const { signatureHtml, bannerHtml, bannerSlotHtmls } = useMemo(
    () => splitSignatureAndBannerHtml(generatedHTML),
    [generatedHTML]
  );
  const hasSplitBanner = Boolean(bannerHtml);
  const bannerPreviewSlots = useMemo(() => {
    if (!bannerHtml?.trim()) return [];
    const slots =
      Array.isArray(bannerSlotHtmls) && bannerSlotHtmls.length > 0
        ? bannerSlotHtmls
        : [bannerHtml];
    return slots.filter((s) => String(s || '').trim());
  }, [bannerHtml, bannerSlotHtmls]);

  const previewLockRailPx = useMemo(() => bundleRailPxForSignature(signature), [signature]);

  const sigInner = hasSplitBanner ? signatureHtml || PREVIEW_LOADING_P : generatedHTML || PREVIEW_LOADING_P;

  const bareWrapOptions = useMemo(
    () => ({
      bare: true,
      baseHref: appBaseHref,
      editorLockRailPx: previewLockRailPx,
    }),
    [appBaseHref, previewLockRailPx]
  );

  const sigSrcDoc = useMemo(
    () => wrapSignatureHtmlForIframe(sigInner, bareWrapOptions),
    [sigInner, bareWrapOptions]
  );
  const bannerSrcDocs = useMemo(
    () =>
      bannerPreviewSlots.map((slotHtml) =>
        wrapSignatureHtmlForIframe(slotHtml || PREVIEW_LOADING_P, bareWrapOptions)
      ),
    [bannerPreviewSlots, bareWrapOptions]
  );

  const sigFrameKey = useMemo(() => hashSrcDoc(sigSrcDoc), [sigSrcDoc]);
  const banFrameKeys = useMemo(
    () => bannerSrcDocs.map((doc) => hashSrcDoc(doc)),
    [bannerSrcDocs]
  );
  const saveHint =
    saving || saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? 'Save failed'
          : null;

  const onRemoveBannerSlot = useCallback(
    (slotIndex) => {
      if (slotIndex === 0) setBanner(null);
      else setSecondaryBanner(null);
    },
    [setBanner, setSecondaryBanner]
  );

  const splitStack = hasSplitBanner;
  const previewMaxW = 'max-w-[min(100%,min(1100px,96vw))]';
  const stackGap = splitStack ? 'gap-5' : 'gap-7';
  const sectionGap = splitStack ? 'gap-2' : 'gap-3';
  const previewHeadingClass = splitStack
    ? 'text-[13px] font-semibold tracking-tight text-slate-600 sm:text-sm'
    : 'text-[17px] font-semibold tracking-tight text-[#0d0f14] sm:text-[18px]';

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <div
        className="flex min-h-0 w-full flex-1 flex-col items-center justify-start overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5 sm:py-5"
        style={{
          WebkitOverflowScrolling: 'touch',
          background:
            'linear-gradient(180deg, #fafbfc 0%, #f5f6f8 40%, #eef0f3 100%)',
        }}
      >
        <div className={`mx-auto flex w-full ${previewMaxW} flex-col pb-4`}>
          <div className={`mx-auto flex w-full flex-col ${stackGap}`}>
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
            <section className={`flex w-full min-w-0 flex-col ${sectionGap}`}>
              <div
                className={`flex w-full min-w-0 justify-between gap-3 px-0.5 sm:gap-4 ${
                  splitStack ? 'items-center' : 'items-start'
                }`}
              >
                <div className={`min-w-0 flex-1 ${splitStack ? 'pt-0' : 'pt-0.5'}`}>
                  <h2
                    className={`leading-tight ${previewHeadingClass}`}
                    aria-label={`My signature: ${signature?.label || 'Untitled'}`}
                  >
                    My signature
                  </h2>
                  {saveHint ? (
                    <p className={splitStack ? 'mt-0 text-[11px] text-slate-400' : 'mt-0.5 text-xs text-[#8b91a0]'}>
                      {saveHint}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                  <PreviewIconButton title="My information" onClick={goInfo}>
                    <HiOutlinePencilSquare className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
                  </PreviewIconButton>
                  <PreviewIconButton title="Palettes" onClick={goPalettes}>
                    <HiOutlineSwatch className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
                  </PreviewIconButton>
                  <PreviewIconButton title="Layouts" onClick={goLayouts}>
                    <HiOutlineDocumentDuplicate
                      className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </PreviewIconButton>
                </div>
              </div>
              <div className={`flex w-full min-w-0 justify-center ${splitStack ? 'min-h-0' : 'min-h-[240px]'}`}>
                <PreviewIframeBlock
                  srcDoc={sigSrcDoc}
                  frameKey={sigFrameKey}
                  minHeightFloor={SIG_PREVIEW_IFRAME_MIN_H}
                  lockRailPx={previewLockRailPx}
                />
              </div>
            </section>

            {hasSplitBanner
              ? bannerPreviewSlots.map((_, slotIdx) => (
                  <section key={slotIdx} className={`relative z-10 flex w-full min-w-0 flex-col ${sectionGap}`}>
                    <div className="relative z-20 flex w-full min-w-0 items-center justify-between gap-3 bg-transparent px-0.5 py-0 sm:gap-4">
                      <h3 className={`min-w-0 flex-1 leading-tight ${previewHeadingClass}`}>
                        Banner {slotIdx + 1}
                      </h3>
                      <div className="relative z-20 flex shrink-0 items-center gap-0.5 sm:gap-1">
                        <PreviewIconButton title="Edit banner" onClick={goInfoBanner}>
                          <HiOutlinePencilSquare className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
                        </PreviewIconButton>
                        <PreviewDeleteButton
                          title={slotIdx === 0 ? 'Remove all banners' : 'Remove this banner'}
                          onClick={() => onRemoveBannerSlot(slotIdx)}
                        />
                      </div>
                    </div>
                    <div className={`flex w-full justify-center ${splitStack ? 'min-h-0' : 'min-h-[120px]'}`}>
                      <PreviewIframeBlock
                        srcDoc={bannerSrcDocs[slotIdx] ?? PREVIEW_LOADING_P}
                        frameKey={banFrameKeys[slotIdx] ?? `ban-${slotIdx}`}
                        minHeightFloor={PREVIEW_IFRAME_HEIGHT_FLOOR}
                        lockRailPx={previewLockRailPx}
                      />
                    </div>
                  </section>
                ))
              : null}

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
          </div>
        </div>
      </div>

      {typeof onDoneEditing === 'function' ? (
        <footer className="shrink-0 border-t border-slate-200/90 bg-[#fafbfc] px-4 py-4 sm:px-5 sm:py-5">
          <div className={`mx-auto flex w-full justify-center ${previewMaxW}`}>
            <Button
              type="button"
              disabled={saving}
              onClick={onDoneEditing}
              className="inline-flex w-full max-w-[320px] items-center justify-center gap-2 !rounded-full !border-0 !bg-[#2d65f0] !py-3.5 !text-[15px] !font-semibold !text-white shadow-[0_4px_14px_rgba(45,101,240,0.28)] transition hover:!bg-[#2557d6] hover:-translate-y-px active:translate-y-0"
            >
              <HiOutlineCheckCircle className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
              {saving ? savingLabel : doneEditingLabel}
            </Button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
