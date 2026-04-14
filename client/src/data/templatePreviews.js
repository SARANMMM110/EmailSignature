/**
 * Brand default for new signatures, editor starter content, and `/html/generate` demo payloads.
 * Keep in sync with `DEMO_FORM_DEFAULTS` in `server/src/services/htmlGenerator.js`.
 */
export const DEMO_SIGNATURE_DATA = {
  fields: {
    full_name: 'James Doe',
    job_title: 'Software Engineer',
    company: 'Core',
    phone: '+(91) 9865456739',
    email: 'James@core.com',
    website: 'www.core.com',
    address: 'Office 60,\nCalicut\nkerala, India',
    photo_url: 'https://i.pravatar.cc/160?img=12',
    /** Sample brand mark for gallery + editor empty state (HTTPS PNG). */
    logo_url: 'https://dummyimage.com/180x36/4752c4/ffffff.png&text=Core',
  },
  design: {
    colors: ['#5768f3', '#4752c4', '#b4b9ff', '#0f172a'],
    font: "'Montserrat', 'Poppins', 'Roboto', -apple-system, Helvetica, Arial, sans-serif",
  },
  social_links: {
    linkedin: '',
    medium: '',
    twitter: '',
    instagram: '',
    github: '',
    facebook: '',
  },
  show_badge: true,
  signature_link: '',
};

/**
 * Body for POST /api/html/generate — matches server `contextFromEditorPayload` (camelCase form).
 * @param {string} templateSlug e.g. template_1, template_2, template_3
 * @param {string[] | null} [paletteColors] — optional 4 hex colors [primary, secondary, accent, text] for gallery previews
 */
export function demoHtmlGeneratePayload(templateSlug, paletteColors = null) {
  const d = DEMO_SIGNATURE_DATA.design;
  const f = DEMO_SIGNATURE_DATA.fields;
  const social = DEMO_SIGNATURE_DATA.social_links;
  const colors =
    Array.isArray(paletteColors) && paletteColors.length >= 4
      ? paletteColors.slice(0, 4)
      : d.colors;
  const slug = String(templateSlug || '').toLowerCase();
  const layout4NoCoreDemo = slug === 'template_4';
  return {
    templateId: templateSlug,
    design: { font: d.font },
    form: {
      fullName: f.full_name,
      jobTitle: f.job_title,
      companyName: layout4NoCoreDemo ? '' : f.company,
      phone: f.phone,
      email: f.email,
      website: f.website,
      address: f.address || '',
      photoUrl: f.photo_url,
      logoUrl: layout4NoCoreDemo ? '' : (f.logo_url || '').trim(),
      linkedin: social.linkedin || '',
      twitter: social.twitter || '',
      instagram: social.instagram || '',
      github: social.github || '',
      facebook: social.facebook || '',
      medium: social.medium || '',
      showBadge: DEMO_SIGNATURE_DATA.show_badge,
      signatureLinkUrl: '',
      entireSignatureClickable: false,
      customFields: [],
    },
    palette: {
      primary: colors[0],
      secondary: colors[1],
      accent: colors[2],
      text: colors[3],
    },
    // Omit banner — layout gallery preview should show only the signature block, not a CTA strip.
  };
}

/**
 * CSS `zoom` inside the editor iframe when the HTML rail is locked (e.g. 470px).
 * Layout math in generated HTML stays at the rail width; the wrapper in {@link EditorPreview} widens by this factor so nothing clips.
 */
export const EDITOR_PREVIEW_LOCK_ZOOM = 1.5;

/**
 * Max width (px) for the editor preview iframe shell — rail width × {@link EDITOR_PREVIEW_LOCK_ZOOM}.
 * @param {number} railPx
 */
export function editorPreviewShellMaxPx(railPx) {
  const w = Number(railPx);
  if (!Number.isFinite(w) || w <= 0) return Math.ceil(470 * EDITOR_PREVIEW_LOCK_ZOOM);
  return Math.ceil(w * EDITOR_PREVIEW_LOCK_ZOOM);
}

/**
 * Wraps a signature HTML fragment in a minimal document for iframe srcDoc.
 * @param {string} signatureHTML
 * @param {{ compact?: boolean, bare?: boolean, baseHref?: string, previewWidthPx?: number, galleryCard?: boolean, editorLockRailPx?: number, editorPreviewZoom?: number }} [options] — `bare` = editor preview; `galleryCard` = layout picker: tight vertical chrome + shrink-wrap height. `editorLockRailPx` = fixed content width inside iframe (e.g. 600) for split signature/banner previews. `editorPreviewZoom` overrides default scale when rail is locked.
 */
function escapeBaseHref(url) {
  return String(url || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;');
}

export function wrapSignatureHtmlForIframe(signatureHTML, options = {}) {
  const body = signatureHTML || '';
  const compact = Boolean(options.compact);
  const bare = Boolean(options.bare);
  const galleryCard = Boolean(options.galleryCard);
  const baseHrefRaw = typeof options.baseHref === 'string' ? options.baseHref.trim() : '';
  const baseTag =
    baseHrefRaw && /^https?:\/\//i.test(baseHrefRaw)
      ? `<base href="${escapeBaseHref(baseHrefRaw)}">`
      : '';
  const pad = bare
    ? '0'
    : galleryCard
      ? '0'
      : compact
        ? '6px 8px 10px'
        : '10px 12px 14px';
  const minW = bare ? '0' : galleryCard ? '0' : compact ? '280px' : '300px';
  const fillPreview = !compact;
  /** Gallery card: transparent — outer TemplateCard provides the gray preview well. */
  const bodyBg = bare ? 'transparent' : galleryCard ? 'transparent' : '#ffffff';
  /** Layout width used before CSS zoom (matches Layout 1 outer table, e.g. 600px email-safe). */
  const previewBasePx =
    typeof options.previewWidthPx === 'number' && options.previewWidthPx > 0
      ? options.previewWidthPx
      : 600;
  const editorLockRailPx =
    typeof options.editorLockRailPx === 'number' && options.editorLockRailPx > 0
      ? Math.round(options.editorLockRailPx)
      : 0;
  const editorPreviewZoom =
    typeof options.editorPreviewZoom === 'number' && options.editorPreviewZoom > 0
      ? options.editorPreviewZoom
      : EDITOR_PREVIEW_LOCK_ZOOM;
  const bodyContainer = fillPreview ? 'container-type: inline-size;' : '';
  /** Gallery / non-editor previews only (editor uses bare override below). */
  const zoomMax = 1.55;
  const barePreviewCss =
    bare && fillPreview
      ? `
  /* Shrink-wrap so iframe width matches the card (centers with parent flex). */
  [data-sig-preview="bare"] .sig-zoom-wrap {
    width: fit-content !important;
    max-width: 100% !important;
    /*
     * Shrink-wrapped iframe ⇒ container query width ≈ intrinsic layout, so
     * calc(100cqi / preview width) sits at the 0.78 clamp floor and stays tiny.
     * Editor preview: fixed scale so the card reads large on the canvas.
     */
    zoom: 1.42 !important;
  }
  @media (max-width: 480px) {
    body[data-sig-preview="bare"]:not([data-sig-editor-lock-rail]) .sig-zoom-wrap {
      zoom: 1.12 !important;
    }
  }
  /* Editor preview: transparent chrome; pin layout roots so column math matches paste HTML. */
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"] {
    max-width: 100% !important;
    background-color: transparent !important;
    background-image: none !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:470px"] {
    width: 470px !important;
    max-width: 470px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:500px"] {
    width: 500px !important;
    max-width: 500px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:520px"] {
    width: 520px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:520px"] {
    width: 520px !important;
    max-width: 520px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:520px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:520px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 520px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:520px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 520px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:600px"] {
    width: 600px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:640px"] {
    width: 640px !important;
    max-width: 640px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:700px"] {
    width: 700px !important;
  }
  /* Signature + banner bundle: full-width cells inside the outer rail. */
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:520px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:520px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 520px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:520px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 520px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:600px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:600px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 600px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:600px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 600px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:640px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:640px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 640px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:640px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 640px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:700px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:700px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 700px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:700px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 700px !important;
    box-sizing: border-box;
  }
  /* Sibling bundle tables: 470 / 500 / 520 / 600px rails (Layouts 4, 2, 1&5, 3). */
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:470px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:470px"] {
    width: 470px !important;
    max-width: 470px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:500px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:500px"] {
    width: 500px !important;
    max-width: 500px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:520px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:520px"] {
    width: 520px !important;
    max-width: 520px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:600px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:600px"] {
    width: 600px !important;
    max-width: 600px !important;
    box-sizing: border-box;
  }
  /* Layout 2 (580px root): transparent photo rail in preview only. */
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:580px"] > tbody > tr > td > table > tbody > tr > td[width="28%"] {
    background-color: transparent !important;
  }
`
      : '';

  const editorRailLockCss =
    bare && fillPreview && editorLockRailPx > 0
      ? `
  /* Editor split preview: modest zoom so the 470px rail reads larger; outer shell widens to match (see EditorPreview). */
  [data-sig-preview="bare"][data-sig-editor-lock-rail] .sig-zoom-wrap {
    width: ${editorLockRailPx}px !important;
    max-width: 100% !important;
    zoom: ${editorPreviewZoom} !important;
  }
`
      : '';

  const scaleCss = fillPreview
    ? `
  /* Scale ~480px-wide layouts to fill the preview width (zoom updates layout in Chromium/WebKit/Safari). */
  .sig-zoom-wrap {
    width: ${previewBasePx}px;
    max-width: 100%;
    margin-inline: auto;
    box-sizing: border-box;
    zoom: clamp(0.78, calc(100cqi / ${previewBasePx}px), ${zoomMax});
  }
`
    : '';
  const innerHtml = fillPreview
    ? `<div class="sig-zoom-wrap">\n${body}\n</div>`
    : body;
  const rootOverflow = fillPreview
    ? `overflow: hidden;`
    : `overflow-x: auto;`;
  const galleryChromeCss = galleryCard
    ? `
  /* Layout gallery: fill iframe and vertically center the signature (marketplace-style cards). */
  html.sig-gallery-preview,
  html.sig-gallery-preview body {
    height: 100% !important;
    min-height: 100% !important;
  }
  html.sig-gallery-preview body {
    justify-content: center !important;
    -webkit-overflow-scrolling: touch;
  }
  html.sig-gallery-preview .sig-iframe-host {
    justify-content: center !important;
    max-height: 100%;
    width: 100%;
  }
  /*
   * Gallery cards are narrow; the default zoom floor (0.78) keeps a 600px root wider than the
   * iframe → right column clips under overflow:hidden. Scale to fit container width instead.
   */
  html.sig-gallery-preview .sig-zoom-wrap {
    zoom: min(${zoomMax}, calc(100cqi / ${previewBasePx}px)) !important;
  }
`
    : '';

  /** Editor bare iframe: skip remote fonts (sandbox / CSP / offline) — system stack only. */
  const poppinsLink = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&family=Poppins:wght@300;400;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">`;
  const fontLinks = bare ? '' : poppinsLink;
  const bodyFontFamily = bare
    ? "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    : "'Montserrat', 'Poppins', 'Roboto', -apple-system, Helvetica, Arial, sans-serif";
  const htmlRootAttrs = galleryCard ? ' class="sig-gallery-preview"' : '';
  return `<!DOCTYPE html>
<html${htmlRootAttrs}>
<head>
<meta charset="utf-8">
${baseTag}
<meta name="viewport" content="width=device-width, initial-scale=1">
${fontLinks}
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%;
    min-width: ${minW};
    ${bare ? 'background: transparent;' : ''}
    ${rootOverflow}
    -webkit-text-size-adjust: 100%;
  }
  body {
    font-family: ${bodyFontFamily};
    padding: ${pad};
    background: ${bodyBg};
    box-sizing: border-box;
    ${bodyContainer}
    ${fillPreview ? 'display: flex; flex-direction: column; align-items: center;' : ''}
  }
  .sig-iframe-host {
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    box-sizing: border-box;
  }
  ${scaleCss}
  ${barePreviewCss}
  ${editorRailLockCss}
  ${galleryChromeCss}
</style>
</head>
<body${bare ? ' data-sig-preview="bare"' : ''}${bare && editorLockRailPx > 0 ? ' data-sig-editor-lock-rail="1"' : ''}>
<div class="sig-iframe-host">
${innerHtml}
</div>
</body>
</html>`;
}
