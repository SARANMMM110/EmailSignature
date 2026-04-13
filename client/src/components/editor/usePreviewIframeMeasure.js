import { useCallback, useEffect, useRef, useState } from 'react';

const FLOOR = 160;

/**
 * Iframe that hosts `srcDoc` from {@link wrapSignatureHtmlForIframe}; measures `.sig-iframe-host` height.
 */
export function usePreviewIframeMeasure(srcDoc, frameKey) {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(FLOOR);
  const [widthPx, setWidthPx] = useState(null);

  const measure = useCallback(() => {
    const el = iframeRef.current;
    if (!el) return;
    try {
      const doc = el.contentDocument;
      const body = doc?.body;
      if (!body) return;
      const host = body.querySelector('.sig-iframe-host');
      const padTop = parseFloat(getComputedStyle(body).paddingTop) || 0;
      const padBottom = parseFloat(getComputedStyle(body).paddingBottom) || 0;
      const padLeft = parseFloat(getComputedStyle(body).paddingLeft) || 0;
      const padRight = parseFloat(getComputedStyle(body).paddingRight) || 0;
      let contentH = 0;
      if (host) {
        const zw = host.querySelector('.sig-zoom-wrap');
        if (zw && typeof zw.getBoundingClientRect === 'function') {
          try {
            const br = body.getBoundingClientRect();
            const zr = zw.getBoundingClientRect();
            contentH = Math.ceil(zr.bottom - br.top);
          } catch {
            contentH = host.offsetHeight;
          }
        } else {
          contentH = host.offsetHeight;
        }
        contentH = Math.max(contentH, host.scrollHeight, host.offsetHeight);
      }
      const raw = host
        ? Math.ceil(padTop + contentH + padBottom)
        : Math.max(body.scrollHeight, body.offsetHeight, FLOOR);
      setHeight(Math.max(Math.min(raw, 8000), FLOOR));

      const zoom = host?.querySelector('.sig-zoom-wrap');
      if (zoom && typeof zoom.getBoundingClientRect === 'function') {
        const rw = Math.ceil(zoom.getBoundingClientRect().width + padLeft + padRight + 2);
        setWidthPx(Number.isFinite(rw) ? Math.min(Math.max(rw, 120), 1900) : null);
      } else {
        setWidthPx(null);
      }
    } catch {
      setHeight(280);
      setWidthPx(null);
    }
  }, []);

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    let ro;
    const onLoad = () => {
      measure();
      try {
        const doc = el.contentDocument;
        if (typeof ResizeObserver !== 'undefined') {
          ro = new ResizeObserver(() => measure());
          if (doc?.documentElement) ro.observe(doc.documentElement);
          if (doc?.body) ro.observe(doc.body);
        }
      } catch {
        /* ignore */
      }
    };
    el.addEventListener('load', onLoad);
    return () => {
      el.removeEventListener('load', onLoad);
      ro?.disconnect();
    };
  }, [measure, srcDoc]);

  useEffect(() => {
    const timers = [0, 80, 250, 600, 1200].map((ms) => setTimeout(measure, ms));
    return () => timers.forEach(clearTimeout);
  }, [srcDoc, frameKey, measure]);

  return { iframeRef, height, widthPx, measure };
}
