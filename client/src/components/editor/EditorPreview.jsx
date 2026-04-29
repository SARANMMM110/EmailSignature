import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineCheckCircle,
  HiOutlineDocumentDuplicate,
  HiOutlinePencilSquare,
  HiOutlineSwatch,
} from 'react-icons/hi2';
import { Button } from '../ui/Button.jsx';
import { useEditorStore } from '../../store/editorStore.js';
import { useI18n } from '../../hooks/useI18n.js';
import {
  editorBlankBannerPreviewIframeHeightPx,
  editorSplitCtaIframeHeightCeilingPx,
  wrapSignatureHtmlForIframe,
} from '../../data/templatePreviews.js';
import {
  bannerSlotVisualFingerprint,
  splitSignatureAndBannerHtml,
} from '../../lib/splitSignatureBannerHtml.js';
import {
  BLANK_IMAGE_BANNER_UUID,
  bundleRailPxForSignature,
  isBlankImageBannerPreset,
  normalizeSignatureTemplateSlug,
} from '../../lib/templateIds.js';
import {
  hashSrcDoc,
  PreviewIconButton,
  PreviewDeleteButton,
  PreviewIframeBlock,
  CTA_PREVIEW_CLICK_SCOPE,
} from './previewBits/index.js';

/** Signature preview needs a taller floor so the card is not clipped before measure runs. */
const SIG_PREVIEW_IFRAME_MIN_H = 320;
/** Shorter floor for stacked CTA strip iframes (book-a-call / webinar rows). */
const CTA_PREVIEW_IFRAME_MIN_H = 112;
const PREVIEW_LOADING_P =
  '<p style="font-family:Arial,sans-serif;padding:8px;color:#94a3b8">Loading preview…</p>';

export function EditorPreview({
  saveStatus,
  saving,
  onDoneEditing,
  doneEditingLabel = 'Done editing',
  savingLabel = 'Saving…',
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useI18n();

  const generatedHTML = useEditorStore((s) => s.generatedHTML);
  const previewSlotBundle = useEditorStore((s) => s.previewSlotBundle);
  const previewError = useEditorStore((s) => s.previewError);
  const refreshPreviewNow = useEditorStore((s) => s.refreshPreviewNow);
  const clearPrimaryBanner = useEditorStore((s) => s.clearPrimaryBanner);
  const setSecondaryBanner = useEditorStore((s) => s.setSecondaryBanner);
  const setBanner = useEditorStore((s) => s.setBanner);
  const signature = useEditorStore((s) => s.signature);

  const bc = signature?.banner_config || {};
  const hasBannerConfigured = Boolean(
    signature?.banner_id || String(bc.link_url || bc.href || '').trim()
  );
  const base = `/editor/${id}`;
  const goInfo = () =>
    navigate(`${base}#editor-myinfo-signature`, { state: { myInfoSubTab: 'signature' } });
  const goPalettes = () => navigate(`${base}/palettes`);
  const goLayouts = () => navigate(`${base}/layouts`);
  const goBanners = useCallback(() => navigate(`${base}/banners`), [navigate, base]);

  const goMyInfoBanner = useCallback(
    (slotIndex) => {
      const hash = slotIndex === 1 ? 'editor-myinfo-banner-2' : 'editor-myinfo-banner';
      navigate(`${base}#${hash}`, {
        state: { myInfoSubTab: 'banner' },
      });
    },
    [navigate, base]
  );

  const applyImageOnlyBanner = useCallback(() => {
    void setBanner(BLANK_IMAGE_BANNER_UUID);
  }, [setBanner]);

  const appBaseHref =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/`
      : '';

  const { signatureHtml, bannerHtml, bannerSlotHtmls } = useMemo(() => {
    const b = previewSlotBundle;
    if (
      b &&
      typeof b.signatureHtml === 'string' &&
      b.signatureHtml.trim() &&
      Array.isArray(b.bannerSlotHtmls) &&
      b.bannerSlotHtmls.length > 0
    ) {
      const slots = b.bannerSlotHtmls.map((s) => String(s || '').trim()).filter(Boolean);
      return {
        signatureHtml: b.signatureHtml.trim(),
        bannerHtml: slots[0] || '',
        bannerSlotHtmls: slots,
      };
    }
    const split = splitSignatureAndBannerHtml(generatedHTML);
    return {
      signatureHtml: String(split.signatureHtml || '').trim(),
      bannerHtml: split.bannerHtml,
      bannerSlotHtmls: split.bannerSlotHtmls,
    };
  }, [generatedHTML, previewSlotBundle]);

  const hasSplitBanner = Boolean(bannerHtml);
  /**
   * Split HTML often lists the same strip twice (slot 1 + slot 2) with different `data-sig-*` shells.
   * Dedupe by {@link bannerSlotVisualFingerprint}, not raw string equality.
   */
  const bannerPreviewSlotEntries = useMemo(() => {
    if (!bannerHtml?.trim()) return [];
    const slots =
      Array.isArray(bannerSlotHtmls) && bannerSlotHtmls.length > 0
        ? bannerSlotHtmls
        : [bannerHtml];
    const trimmed = slots.map((s) => String(s || '').trim()).filter(Boolean);
    const seen = new Set();
    const out = [];
    for (let slotIndex = 0; slotIndex < trimmed.length; slotIndex++) {
      const html = trimmed[slotIndex];
      const fp = bannerSlotVisualFingerprint(html);
      const key = fp || html;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ html, sourceSlotIndex: slotIndex });
    }
    return out;
  }, [bannerHtml, bannerSlotHtmls]);

  const bannerPreviewSlots = useMemo(
    () => bannerPreviewSlotEntries.map((e) => e.html),
    [bannerPreviewSlotEntries]
  );

  const useStackedCtaFrames = Boolean(
    hasSplitBanner && signatureHtml && bannerPreviewSlots.length > 0
  );

  const previewLockRailPx = useMemo(() => bundleRailPxForSignature(signature), [signature]);
  const splitCtaIframeHeightCeiling = useMemo(
    () => editorSplitCtaIframeHeightCeilingPx(previewLockRailPx),
    [previewLockRailPx]
  );
  const blankStripPreviewIframeH = useMemo(
    () => editorBlankBannerPreviewIframeHeightPx(previewLockRailPx),
    [previewLockRailPx]
  );
  const slot0IsBlankStrip = isBlankImageBannerPreset(bc.preset_id, signature?.banner_id);
  const slot1IsBlankStrip =
    Boolean(bc.secondary_banner_id) &&
    isBlankImageBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const layoutSlug = useMemo(
    () => normalizeSignatureTemplateSlug(signature?.design, signature?.template_id),
    [signature?.design, signature?.template_id]
  );

  const bareWrapOptions = useMemo(
    () => ({
      bare: true,
      baseHref: appBaseHref,
      editorLockRailPx: previewLockRailPx,
      previewWidthPx: previewLockRailPx,
      includeArchivoFont: layoutSlug === 'template_13' || layoutSlug === 'template_14',
    }),
    [appBaseHref, previewLockRailPx, layoutSlug]
  );

  const combinedSrcDoc = useMemo(
    () => wrapSignatureHtmlForIframe(generatedHTML || PREVIEW_LOADING_P, bareWrapOptions),
    [generatedHTML, bareWrapOptions]
  );
  const combinedFrameKey = useMemo(() => hashSrcDoc(combinedSrcDoc), [combinedSrcDoc]);

  const signatureOnlySrcDoc = useMemo(
    () => wrapSignatureHtmlForIframe(signatureHtml || PREVIEW_LOADING_P, bareWrapOptions),
    [signatureHtml, bareWrapOptions]
  );
  const signatureOnlyFrameKey = useMemo(() => hashSrcDoc(signatureOnlySrcDoc), [signatureOnlySrcDoc]);

  const ctaSlotFrames = useMemo(
    () =>
      bannerPreviewSlotEntries.map(({ html, sourceSlotIndex }) => ({
        srcDoc: wrapSignatureHtmlForIframe(String(html || '').trim(), bareWrapOptions),
        sourceSlotIndex,
      })),
    [bannerPreviewSlotEntries, bareWrapOptions]
  );

  const removeCtaAtSlot = useCallback(
    (slotIndex) => {
      void (async () => {
        if (slotIndex === 0) await clearPrimaryBanner();
        else await setSecondaryBanner(null);
      })();
    },
    [clearPrimaryBanner, setSecondaryBanner]
  );

  const saveHint =
    saving || saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? 'Save failed'
          : null;

  const previewMaxW = 'max-w-[min(100%,min(1100px,96vw))]';
  const stackGap = useStackedCtaFrames ? 'gap-8 sm:gap-10' : 'gap-7';
  const sectionInnerGap = 'gap-2 sm:gap-2.5';
  const sectionHeaderClass =
    'relative z-20 flex w-full min-w-0 items-center justify-between gap-3 border-b border-slate-200/80 px-0.5 pb-3 sm:gap-4 sm:pb-3.5';
  const titleClass = 'text-[17px] font-semibold tracking-tight text-[#0d0f14] sm:text-[18px]';

  const previewBg =
    layoutSlug === 'template_15' ||
    layoutSlug === 'template_16' ||
    layoutSlug === 'template_17' ||
    layoutSlug === 'template_18' ||
    layoutSlug === 'template_19' ||
    layoutSlug === 'template_20' ||
    layoutSlug === 'template_21'
      ? '#ffffff'
      : 'linear-gradient(180deg, #fafbfc 0%, #f5f6f8 40%, #eef0f3 100%)';

  const previewHeaderActions = (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      <PreviewIconButton title="My information" onClick={goInfo}>
        <HiOutlinePencilSquare className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
      </PreviewIconButton>
      <PreviewIconButton title="Palettes" onClick={goPalettes}>
        <HiOutlineSwatch className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
      </PreviewIconButton>
      <PreviewIconButton title="Layouts" onClick={goLayouts}>
        <HiOutlineDocumentDuplicate className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
      </PreviewIconButton>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <div
        className="flex min-h-0 w-full flex-1 flex-col items-center justify-start overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5 sm:py-5"
        style={{
          WebkitOverflowScrolling: 'touch',
          background: previewBg,
        }}
      >
        <div className={`mx-auto flex w-full ${previewMaxW} flex-col pb-4 lg:pb-6`}>
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

            {/* My signature — title row + preview (matches mock: no date line under title) */}
            <section className={`relative z-10 flex w-full min-w-0 flex-col ${sectionInnerGap}`}>
              <div className={sectionHeaderClass}>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 className={titleClass} aria-label={`My signature: ${signature?.label || 'Untitled'}`}>
                    My signature
                  </h2>
                  {saveHint ? <p className="mt-0.5 text-xs text-[#8b91a0]">{saveHint}</p> : null}
                </div>
                {previewHeaderActions}
              </div>
              {useStackedCtaFrames ? (
                <div className="flex w-full min-w-0 justify-center rounded-xl">
                  <PreviewIframeBlock
                    srcDoc={signatureOnlySrcDoc}
                    frameKey={signatureOnlyFrameKey}
                    minHeightFloor={SIG_PREVIEW_IFRAME_MIN_H}
                    lockRailPx={previewLockRailPx}
                  />
                </div>
              ) : (
                <div className="flex min-h-[240px] w-full min-w-0 justify-center rounded-xl">
                  <PreviewIframeBlock
                    srcDoc={combinedSrcDoc}
                    frameKey={combinedFrameKey}
                    minHeightFloor={SIG_PREVIEW_IFRAME_MIN_H}
                    lockRailPx={previewLockRailPx}
                    ctaPreviewClickScope={CTA_PREVIEW_CLICK_SCOPE.COMBINED}
                    onCtaPreviewNavigate={() => goMyInfoBanner(0)}
                  />
                </div>
              )}
            </section>

            {/* Banner 1 / Banner 2 — each: title row + edit/delete + iframe (mock layout) */}
            {useStackedCtaFrames
              ? ctaSlotFrames.map((frame) => {
                  const { sourceSlotIndex } = frame;
                  const slotIsBlank =
                    sourceSlotIndex === 0 ? slot0IsBlankStrip : slot1IsBlankStrip;
                  const fixedBlankH = slotIsBlank ? blankStripPreviewIframeH : null;
                  return (
                  <section
                    key={`cta-section-${sourceSlotIndex}-${hashSrcDoc(frame.srcDoc)}`}
                    className={`relative z-10 flex w-full min-w-0 flex-col ${sectionInnerGap}`}
                  >
                    <div className={sectionHeaderClass}>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h2 className={titleClass}>{t('editor.bannerSlot', { n: sourceSlotIndex + 1 })}</h2>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                        <PreviewIconButton
                          title={t('editor.editBannerSlot', { n: sourceSlotIndex + 1 })}
                          onClick={(e) => {
                            e.stopPropagation();
                            goMyInfoBanner(sourceSlotIndex);
                          }}
                        >
                          <HiOutlinePencilSquare className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
                        </PreviewIconButton>
                        <PreviewDeleteButton title={t('editor.removeCta')} onClick={() => removeCtaAtSlot(sourceSlotIndex)} />
                      </div>
                    </div>
                    <div className="w-full min-w-0">
                      <PreviewIframeBlock
                        srcDoc={frame.srcDoc}
                        frameKey={hashSrcDoc(frame.srcDoc)}
                        minHeightFloor={fixedBlankH ?? CTA_PREVIEW_IFRAME_MIN_H}
                        lockRailPx={previewLockRailPx}
                        measureFloor={fixedBlankH ?? 40}
                        measureCeiling={fixedBlankH ?? splitCtaIframeHeightCeiling}
                        ctaPreviewClickScope={CTA_PREVIEW_CLICK_SCOPE.BANNER_ONLY}
                        onCtaPreviewNavigate={() => goMyInfoBanner(sourceSlotIndex)}
                      />
                    </div>
                  </section>
                  );
                })
              : null}

            {hasSplitBanner ? null : hasBannerConfigured ? null : (
              <div className="rounded-[14px] border border-dashed border-slate-400/35 bg-transparent px-5 py-4 text-center sm:px-8 sm:py-5">
                <p className="text-sm leading-relaxed text-[#4a5060]">{t('editor.needCtaPrompt')}</p>
                <button
                  type="button"
                  onClick={applyImageOnlyBanner}
                  className="mt-3 inline-flex w-full max-w-[280px] items-center justify-center rounded-full bg-[#2d65f0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2557d6]"
                >
                  {t('editor.addImageOnlyStrip')}
                </button>
                <button
                  type="button"
                  onClick={goBanners}
                  className="mt-2 block w-full text-sm font-semibold text-[#2d5be3] underline-offset-4 hover:underline"
                >
                  {t('editor.browseAllCtaStyles')}
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
