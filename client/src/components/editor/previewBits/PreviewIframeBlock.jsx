import { useMemo } from 'react';
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
