import { useMemo } from 'react';
import { wrapSignatureHtmlForIframe } from '../../data/templatePreviews.js';

/**
 * Renders server-generated signature HTML in a gallery-style iframe (email fonts + zoom).
 */
export function LandingSignatureIframe({ html, className = '', minHeight = 200 }) {
  const srcDoc = useMemo(
    () => (html ? wrapSignatureHtmlForIframe(html, { galleryCard: true }) : ''),
    [html]
  );

  if (!html) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-slate-100 text-xs font-medium text-slate-400 ${className}`}
        style={{ minHeight }}
      >
        Loading preview…
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-50 ${className}`}
      style={{ minHeight }}
    >
      <iframe
        title="Email signature preview"
        className="block w-full border-0 transition-opacity duration-500"
        style={{ minHeight }}
        sandbox="allow-same-origin"
        srcDoc={srcDoc}
      />
    </div>
  );
}
