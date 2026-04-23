import { useEffect, useMemo, useRef } from 'react';
import { usePreviewIframeMeasure } from '../usePreviewIframeMeasure.js';
import { editorPreviewShellMaxPx } from '../../../data/templatePreviews.js';

/** Floor for iframe height while loading or if measurement fails. */
const PREVIEW_IFRAME_HEIGHT_FLOOR_DEFAULT = 200;

export function hashSrcDoc(s) {
  let h = 0;
  const cap = Math.min(s.length, 8000);
  for (let i = 0; i < cap; i++) h = (h * 33 + s.charCodeAt(i)) | 0;
  return `${s.length}-${h}`;
}

/**
 * Scope for forwarding clicks in the preview iframe to My Information → banner editor (`#editor-myinfo-banner`).
 * @typedef {'off'|'combined'|'banner-only'} CtaPreviewClickScope
 */
export const CTA_PREVIEW_CLICK_SCOPE = {
  OFF: 'off',
  /** Signature + banner in one doc — only clicks inside the banner region count. */
  COMBINED: 'combined',
  /** Banner-only srcDoc — any click in the iframe counts. */
  BANNER_ONLY: 'banner-only',
};

function clickTargetIsInBannerRegion(target, scope) {
  if (!target || typeof target.closest !== 'function') return false;
  if (scope === CTA_PREVIEW_CLICK_SCOPE.BANNER_ONLY) return true;
  return Boolean(
    target.closest('[data-sig-part="banner"]') ||
      target.closest('table[data-sig-part="banner"]') ||
      target.closest('[data-sig-cta-slot="1"]') ||
      target.closest('[data-sig-cta-slot="2"]')
  );
}

/**
 * Measured signature / banner iframe — width shell matches locked rail when `lockRailPx` is set.
 */
export function PreviewIframeBlock({
  srcDoc,
  frameKey,
  minHeightFloor = PREVIEW_IFRAME_HEIGHT_FLOOR_DEFAULT,
  lockRailPx = null,
  /** Lower bound for measured content height (defaults inside hook when omitted). */
  measureFloor,
  /** Upper bound — stops tall `<img>` intrinsic sizes from stretching split CTA iframes. */
  measureCeiling,
  /** Called when the user clicks the CTA preview — e.g. navigate to `#editor-myinfo-banner` on the editor route. */
  ctaPreviewClickScope = CTA_PREVIEW_CLICK_SCOPE.OFF,
  onCtaPreviewNavigate,
}) {
  const key = frameKey ?? hashSrcDoc(srcDoc);
  const measureOpts = useMemo(
    () => ({
      ...(typeof measureFloor === 'number' ? { measureFloor } : {}),
      ...(typeof measureCeiling === 'number' ? { measureCeiling } : {}),
    }),
    [measureFloor, measureCeiling]
  );
  const { iframeRef, height, widthPx, measure } = usePreviewIframeMeasure(srcDoc, key, measureOpts);
  const navigateRef = useRef(onCtaPreviewNavigate);
  navigateRef.current = onCtaPreviewNavigate;

  useEffect(() => {
    if (ctaPreviewClickScope === CTA_PREVIEW_CLICK_SCOPE.OFF) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const attach = () => {
      let doc;
      try {
        doc = iframe.contentDocument;
      } catch {
        return () => {};
      }
      if (!doc) return () => {};

      const handler = (e) => {
        const nav = navigateRef.current;
        if (typeof nav !== 'function') return;
        if (!clickTargetIsInBannerRegion(e.target, ctaPreviewClickScope)) return;
        e.preventDefault();
        e.stopPropagation();
        nav();
      };
      doc.addEventListener('click', handler, true);
      return () => doc.removeEventListener('click', handler, true);
    };

    let detach = attach();
    const onLoad = () => {
      if (typeof detach === 'function') detach();
      detach = attach();
    };
    iframe.addEventListener('load', onLoad);
    return () => {
      iframe.removeEventListener('load', onLoad);
      if (typeof detach === 'function') detach();
    };
  }, [iframeRef, key, srcDoc, ctaPreviewClickScope]);

  const locked = lockRailPx != null && lockRailPx > 0;
  const clickToEditCta = ctaPreviewClickScope !== CTA_PREVIEW_CLICK_SCOPE.OFF && typeof onCtaPreviewNavigate === 'function';
  return (
    <div
      className={[
        locked
          ? 'mx-auto w-full'
          : widthPx == null
            ? 'w-full max-w-[min(100%,min(1100px,96vw))]'
            : '',
        clickToEditCta ? 'cursor-pointer' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        locked
          ? {
              width: '100%',
              maxWidth: `min(100%, ${editorPreviewShellMaxPx(lockRailPx)}px)`,
            }
          : widthPx != null
            ? { width: `${widthPx}px`, maxWidth: '100%' }
            : undefined
      }
    >
      {/* allow-scripts: avoids Chrome “blocked script execution” on about:srcdoc for some embedded content; srcDoc is first-party preview HTML only. */}
      <iframe
        key={key}
        ref={iframeRef}
        title="Preview"
        sandbox="allow-same-origin allow-scripts"
        scrolling="no"
        srcDoc={srcDoc}
        onLoad={measure}
        className="block w-full bg-transparent"
        style={{
          border: 'none',
          minHeight: minHeightFloor,
          height,
          display: 'block',
          /* Locked-rail srcDoc uses CSS zoom; hidden X overflow clipped flush banner borders (e.g. blank placeholder dashed rect). */
          overflowX: locked ? 'visible' : 'hidden',
          overflowY: 'hidden',
        }}
      />
    </div>
  );
}
