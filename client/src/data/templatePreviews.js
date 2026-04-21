/**
 * Brand default for new signatures, editor starter content, and `/html/generate` demo payloads.
 * Keep in sync with `DEMO_FORM_DEFAULTS` in `server/src/services/htmlGenerator.js`.
 */
import {
  TEMPLATE_10_CANONICAL_COLORS,
  TEMPLATE_11_CANONICAL_COLORS,
  TEMPLATE_12_CANONICAL_COLORS,
  TEMPLATE_13_CANONICAL_COLORS,
  TEMPLATE_14_CANONICAL_COLORS,
  TEMPLATE_15_CANONICAL_COLORS,
  TEMPLATE_16_CANONICAL_COLORS,
  TEMPLATE_17_CANONICAL_COLORS,
  TEMPLATE_18_CANONICAL_COLORS,
  TEMPLATE_19_CANONICAL_COLORS,
  TEMPLATE_20_CANONICAL_COLORS,
  uuidToTemplateSlug,
} from '../lib/templateIds.js';
import { profileFormPartialForGenerate } from '../lib/myInfoDraft.js';

export const DEMO_SIGNATURE_DATA = {
  fields: {
    full_name: 'James Doe',
    job_title: 'Software Engineer',
    company: 'Acme Studio',
    phone: '+(91) 9865456739',
    email: 'james.doe@example.com',
    website: 'www.example.com',
    address: 'Office 60,\nCalicut\nkerala, India',
    tagline: '',
    photo_url: 'https://i.pravatar.cc/160?img=12',
    /** Sample brand mark for gallery + editor empty state (HTTPS PNG). */
    logo_url: 'https://dummyimage.com/180x36/4752c4/ffffff.png&text=Logo',
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
    telegram: '',
  },
  show_badge: true,
  signature_link: '',
};

/**
 * Body for POST /api/html/generate — matches server `contextFromEditorPayload` (camelCase form).
 * @param {string} templateSlug e.g. template_1, template_2, template_3
 * @param {string[] | null} [paletteColors] — optional 4 hex colors [primary, secondary, accent, text] for gallery previews
 * @param {{ profile?: object | null, user?: object | null } | null} [accountContext] — when logged in, gallery previews use profile fields over demo copy
 */
export function demoHtmlGeneratePayload(templateSlug, paletteColors = null, accountContext = null) {
  const d = DEMO_SIGNATURE_DATA.design;
  const f = DEMO_SIGNATURE_DATA.fields;
  const social = DEMO_SIGNATURE_DATA.social_links;
  const ctx = accountContext && typeof accountContext === 'object' ? accountContext : {};
  const fromProfile = profileFormPartialForGenerate(ctx.profile, ctx.user);
  const slug = uuidToTemplateSlug(String(templateSlug || '').trim());
  const colors =
    slug === 'template_10'
      ? [...TEMPLATE_10_CANONICAL_COLORS]
      : slug === 'template_11'
        ? [...TEMPLATE_11_CANONICAL_COLORS]
        : slug === 'template_12'
          ? [...TEMPLATE_12_CANONICAL_COLORS]
          : slug === 'template_13'
            ? [...TEMPLATE_13_CANONICAL_COLORS]
            : slug === 'template_14'
              ? [...TEMPLATE_14_CANONICAL_COLORS]
              : slug === 'template_15'
                ? [...TEMPLATE_15_CANONICAL_COLORS]
                : slug === 'template_16'
                  ? [...TEMPLATE_16_CANONICAL_COLORS]
                  : slug === 'template_17'
                    ? [...TEMPLATE_17_CANONICAL_COLORS]
                    : slug === 'template_18'
                      ? [...TEMPLATE_18_CANONICAL_COLORS]
                      : slug === 'template_19'
                        ? [...TEMPLATE_19_CANONICAL_COLORS]
                        : slug === 'template_20'
                          ? [...TEMPLATE_20_CANONICAL_COLORS]
                          : Array.isArray(paletteColors) && paletteColors.length >= 4
                        ? paletteColors.slice(0, 4)
                        : d.colors;
  const layout4NoCoreDemo = slug === 'template_4';
  const layout11Demo =
    slug === 'template_11'
      ? {
          jobTitle: 'Graphic Designer\nCreative Director',
          tagline:
            'The European languages are members of the same family. Their separate existence is a myth.',
        }
      : {};
  const layout12Demo =
    slug === 'template_12'
      ? {
          fullName: 'Rheina Sukha',
          jobTitle: 'FrontEnd Developer',
          phone: '+1 234 567 890',
          email: 'reina.sukha@email.com',
          address: '123 Main Road Center,\nCalifornia USA',
          photoUrl: 'https://static.codia.ai/s/image_4e3a0f16-8719-4bec-99d2-9ef5f3f8cd88.png',
        }
      : {};
  const layout13Demo =
    slug === 'template_13'
      ? {
          fullName: 'Sandro Smith',
          jobTitle: 'Creative Designer',
          phone: '360 658 9854',
          email: 'email@domain.com',
          website: 'domain.com',
          address: 'AV. REFORMA 250, MÉXICO',
          photoUrl: 'https://i.pravatar.cc/200?img=68',
          linkedin: 'https://www.linkedin.com/',
          github: 'https://www.behance.net/',
          instagram: 'https://www.instagram.com/',
        }
      : {};
  const layout14Demo =
    slug === 'template_14'
      ? {
          fullName: 'Nevalda Andromeda',
          jobTitle: 'Graphic Designer, Visual Artist and Web Layout Analyst',
          phone: '+234 567 780',
          email: 'nevalda.andartist@gmail.com',
          website: 'www.maddomormeda.com',
          address: '130 Raw Visual Artist (2580 AT, 440)',
          photoUrl: 'https://i.pravatar.cc/200?img=47',
        }
      : {};
  const layout15Demo =
    slug === 'template_15'
      ? {
          fullName: 'Pauline Roberto',
          jobTitle: 'Web Developer',
          companyName: 'Your Company',
          phone: '+123 456 7890',
          email: 'youremail@mail.com',
          website: 'www.yourwebsite.com',
          address: '123 Empty teater\nLos Angles LA 313\nUnited State',
          photoUrl: 'https://i.pravatar.cc/200?img=32',
        }
      : {};
  const layout16Demo =
    slug === 'template_16'
      ? {
          fullName: 'Michael Hansen',
          jobTitle: 'Marketing expert',
          companyName: 'LOGO HERE',
          phone: '0000 0000 000 00',
          email: 'your mail here',
          website: 'your website here',
          address: 'your city road,\n1234 real estate',
          photoUrl: 'https://i.pravatar.cc/200?img=68',
        }
      : {};
  const layout17Demo =
    slug === 'template_17'
      ? {
          fullName: 'Blue Rayhan',
          jobTitle: 'Graphic Designer',
          phone: '+10 012 345 6789',
          email: 'yourname@email.com',
          website: 'www.websitename.com',
          address: 'Your Street Address Here',
          photoUrl: 'https://i.pravatar.cc/200?img=12',
        }
      : {};
  const layout18Demo =
    slug === 'template_18'
      ? {
          fullName: 'Alex Morgan',
          companyName: 'Acme Studio',
          jobTitle: 'Software Engineer',
          phone: '+100123456789',
          email: 'yourname@email.com',
          website: 'www.websitename.com',
          address: 'Your Street Address Here',
          photoUrl: 'https://i.pravatar.cc/400?img=12',
        }
      : {};
  const layout19Demo =
    slug === 'template_19'
      ? {
          fullName: 'Rishi Saran',
          jobTitle: 'GraphicDesigner',
          phone: '+100123456789',
          email: 'yourname@email.com',
          website: 'www.websitename.com',
          address: 'Your Street Address Here',
          photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=faces',
        }
      : {};
  const layout20Demo =
    slug === 'template_20'
      ? {
          fullName: 'AI USWAH NOOR',
          jobTitle: 'AI GRAPHIC DESIGNER',
          phone: '+100123456789',
          email: 'yourname@email.com',
          website: 'www.websitename.com',
          address: 'Your Street Address Here',
          photoUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=480&h=560&fit=crop&crop=faces&auto=format&q=80',
          logoUrl: 'https://placehold.co/120x36/1e3a5f/ffffff/png?text=Brand',
        }
      : {};
  const baseForm = {
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
    telegram: social.telegram || '',
    medium: social.medium || '',
    tagline: f.tagline ?? f.tag_line ?? '',
    showBadge: DEMO_SIGNATURE_DATA.show_badge,
    signatureLinkUrl: '',
    entireSignatureClickable: false,
    customFields: [],
  };
  const form = { ...baseForm, ...fromProfile };
  if (slug === 'template_11') {
    const demoJob = layout11Demo.jobTitle;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = demoJob;
    if (!String(form.tagline || '').trim()) form.tagline = layout11Demo.tagline;
  }
  if (slug === 'template_12') {
    if (!String(form.fullName || '').trim()) form.fullName = layout12Demo.fullName;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = layout12Demo.jobTitle;
    form.tagline = '';
    if (!String(form.phone || '').trim()) form.phone = layout12Demo.phone;
    if (!String(form.email || '').trim()) form.email = layout12Demo.email;
    if (!String(form.address || '').trim()) form.address = layout12Demo.address;
    if (!String(form.photoUrl || '').trim()) form.photoUrl = layout12Demo.photoUrl;
  }
  if (slug === 'template_13') {
    if (!String(form.fullName || '').trim()) form.fullName = layout13Demo.fullName;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = layout13Demo.jobTitle;
    if (!String(form.phone || '').trim()) form.phone = layout13Demo.phone;
    if (!String(form.email || '').trim()) form.email = layout13Demo.email;
    if (!String(form.website || '').trim()) form.website = layout13Demo.website;
    if (!String(form.address || '').trim()) form.address = layout13Demo.address;
    if (!String(form.photoUrl || '').trim()) form.photoUrl = layout13Demo.photoUrl;
    if (!String(form.linkedin || '').trim()) form.linkedin = layout13Demo.linkedin;
    if (!String(form.github || '').trim()) form.github = layout13Demo.github;
    if (!String(form.instagram || '').trim()) form.instagram = layout13Demo.instagram;
  }
  if (slug === 'template_14') {
    if (!String(form.fullName || '').trim()) form.fullName = layout14Demo.fullName;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = layout14Demo.jobTitle;
    if (!String(form.phone || '').trim()) form.phone = layout14Demo.phone;
    if (!String(form.email || '').trim()) form.email = layout14Demo.email;
    if (!String(form.website || '').trim()) form.website = layout14Demo.website;
    if (!String(form.address || '').trim()) form.address = layout14Demo.address;
    if (!String(form.photoUrl || '').trim()) form.photoUrl = layout14Demo.photoUrl;
  }
  if (slug === 'template_15') {
    if (!String(form.fullName || '').trim()) form.fullName = layout15Demo.fullName;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = layout15Demo.jobTitle;
    if (!String(form.phone || '').trim()) form.phone = layout15Demo.phone;
    if (!String(form.email || '').trim()) form.email = layout15Demo.email;
    if (!String(form.website || '').trim()) form.website = layout15Demo.website;
    if (!String(form.address || '').trim()) form.address = layout15Demo.address;
    if (!String(form.photoUrl || '').trim()) form.photoUrl = layout15Demo.photoUrl;
  }
  if (slug === 'template_16') {
    if (!String(form.fullName || '').trim()) form.fullName = layout16Demo.fullName;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = layout16Demo.jobTitle;
    if (!String(form.companyName || '').trim()) form.companyName = layout16Demo.companyName;
    form.tagline = '';
    if (!String(form.phone || '').trim()) form.phone = layout16Demo.phone;
    if (!String(form.email || '').trim()) form.email = layout16Demo.email;
    if (!String(form.website || '').trim()) form.website = layout16Demo.website;
    if (!String(form.address || '').trim()) form.address = layout16Demo.address;
    if (!String(form.photoUrl || '').trim()) form.photoUrl = layout16Demo.photoUrl;
    form.logoUrl = '';
  }
  if (slug === 'template_17') {
    if (!String(form.fullName || '').trim()) form.fullName = layout17Demo.fullName;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = layout17Demo.jobTitle;
    form.tagline = '';
    if (!String(form.phone || '').trim()) form.phone = layout17Demo.phone;
    if (!String(form.email || '').trim()) form.email = layout17Demo.email;
    if (!String(form.website || '').trim()) form.website = layout17Demo.website;
    if (!String(form.address || '').trim()) form.address = layout17Demo.address;
    if (!String(form.photoUrl || '').trim()) form.photoUrl = layout17Demo.photoUrl;
    form.logoUrl = '';
  }
  if (slug === 'template_18') {
    if (!String(form.fullName || '').trim()) form.fullName = layout18Demo.fullName;
    if (!String(form.companyName || '').trim()) form.companyName = layout18Demo.companyName;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = layout18Demo.jobTitle;
    form.tagline = '';
    if (!String(form.phone || '').trim()) form.phone = layout18Demo.phone;
    if (!String(form.email || '').trim()) form.email = layout18Demo.email;
    if (!String(form.website || '').trim()) form.website = layout18Demo.website;
    if (!String(form.address || '').trim()) form.address = layout18Demo.address;
    if (!String(form.photoUrl || '').trim()) form.photoUrl = layout18Demo.photoUrl;
    form.logoUrl = '';
  }
  if (slug === 'template_19') {
    if (!String(form.fullName || '').trim()) form.fullName = layout19Demo.fullName;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = layout19Demo.jobTitle;
    form.tagline = '';
    if (!String(form.phone || '').trim()) form.phone = layout19Demo.phone;
    if (!String(form.email || '').trim()) form.email = layout19Demo.email;
    if (!String(form.website || '').trim()) form.website = layout19Demo.website;
    if (!String(form.address || '').trim()) form.address = layout19Demo.address;
    if (!String(form.photoUrl || '').trim()) form.photoUrl = layout19Demo.photoUrl;
    form.logoUrl = '';
  }
  if (slug === 'template_20') {
    if (!String(form.fullName || '').trim()) form.fullName = layout20Demo.fullName;
    if (!String(form.jobTitle || '').trim()) form.jobTitle = layout20Demo.jobTitle;
    form.tagline = '';
    if (!String(form.phone || '').trim()) form.phone = layout20Demo.phone;
    if (!String(form.email || '').trim()) form.email = layout20Demo.email;
    if (!String(form.website || '').trim()) form.website = layout20Demo.website;
    if (!String(form.address || '').trim()) form.address = layout20Demo.address;
    if (!String(form.photoUrl || '').trim()) form.photoUrl = layout20Demo.photoUrl;
    if (!String(form.logoUrl || '').trim()) form.logoUrl = layout20Demo.logoUrl;
  }
  if (layout4NoCoreDemo) {
    form.companyName = '';
    form.logoUrl = '';
  }
  const designFont =
    slug === 'template_13' || slug === 'template_14'
      ? "'Archivo', Helvetica, Arial, sans-serif"
      : slug === 'template_15'
        ? "'Montserrat', 'Poppins', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
        : slug === 'template_16'
          ? "'Poppins', 'Montserrat', 'Open Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          : slug === 'template_17'
            ? "'Montserrat', 'Poppins', 'Roboto', Helvetica, Arial, sans-serif"
            : slug === 'template_18' || slug === 'template_19' || slug === 'template_20'
              ? "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              : d.font;
  return {
    templateId: templateSlug,
    design: { font: designFont },
    form,
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
 * Caps split CTA iframe auto-height — intrinsic tall images can inflate `scrollHeight`; keep chrome near real strip size.
 * @param {number} railPx layout rail (e.g. 470)
 */
export function editorSplitCtaIframeHeightCeilingPx(railPx) {
  const rail = Math.max(280, Math.min(720, Math.round(Number(railPx) || 470)));
  const stripH = Math.max(84, Math.round((rail * 140) / 560));
  const cssApprox = stripH + 140;
  return Math.max(220, Math.ceil(cssApprox * EDITOR_PREVIEW_LOCK_ZOOM) + 32);
}

/**
 * Blank strip width in layout CSS px — matches server `blankBannerStripWidthPx`.
 * @param {number} railPx
 */
export function editorBlankBannerStripWidthPx(railPx) {
  const w = Math.round(Number(railPx) || 470);
  return Number.isFinite(w) && w >= 1 ? w : 470;
}

/** Matches server `BLANK_BANNER_REF_*` / upload canvas 720×93. */
const EDITOR_BLANK_BANNER_REF_W = 720;
const EDITOR_BLANK_BANNER_REF_H = Math.round((EDITOR_BLANK_BANNER_REF_W * 72) / 560);

/** CSS `aspect-ratio` for My information / editor blank-strip previews (same ratio as upload). */
export const EDITOR_BLANK_BANNER_ASPECT_RATIO = `${EDITOR_BLANK_BANNER_REF_W} / ${EDITOR_BLANK_BANNER_REF_H}`;

/**
 * Blank strip height in layout CSS px — matches server `blankBannerStripHeightPx`
 * (height ∝ {@link editorBlankBannerStripWidthPx} at upload aspect ratio).
 * @param {number} railPx
 */
export function editorBlankBannerStripHeightPx(railPx) {
  const w = editorBlankBannerStripWidthPx(railPx);
  const h = Math.round((w * EDITOR_BLANK_BANNER_REF_H) / EDITOR_BLANK_BANNER_REF_W);
  return Math.max(48, h);
}

/**
 * Fixed iframe height for split preview when the slot is a blank strip (`zoom` applied in bare wrap).
 * @param {number} railPx
 */
export function editorBlankBannerPreviewIframeHeightPx(railPx) {
  return Math.ceil(editorBlankBannerStripHeightPx(railPx) * EDITOR_PREVIEW_LOCK_ZOOM) + 2;
}

/**
 * Wraps a signature HTML fragment in a minimal document for iframe srcDoc.
 * @param {string} signatureHTML
 * @param {{ compact?: boolean, bare?: boolean, baseHref?: string, previewWidthPx?: number, galleryCard?: boolean, editorLockRailPx?: number, editorPreviewZoom?: number, includeArchivoFont?: boolean }} [options] — `bare` = editor preview; `galleryCard` = layout picker: tight vertical chrome + shrink-wrap height. `editorLockRailPx` = fixed content width inside iframe (e.g. 600) for split signature/banner previews. `editorPreviewZoom` overrides default scale when rail is locked. `includeArchivoFont` = hint to load Archivo in bare mode; Archivo is auto-enabled when the HTML contains `font-family: … Archivo`. Montserrat/Poppins/Roboto load in bare mode when the HTML contains `Montserrat`.
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
  /** Split editor iframes: avoid clipping dashed edges flush with the locked rail (see `.sig-zoom-wrap` below). */
  const editorBareLockedRail = bare && fillPreview && editorLockRailPx > 0;
  const bodyContainer = fillPreview ? 'container-type: inline-size;' : '';
  /** Gallery / non-editor previews only (editor uses bare override below). */
  const zoomMax = 1.55;
  /** Locked split iframes must not use fit-content — banner-only HTML is width:100% and collapses to ~text width. */
  const bareZoomWrapBlock = editorBareLockedRail
    ? `
  body[data-sig-preview="bare"][data-sig-editor-lock-rail] .sig-zoom-wrap {
    width: ${editorLockRailPx}px !important;
    min-width: ${editorLockRailPx}px !important;
    max-width: 100% !important;
    zoom: ${editorPreviewZoom} !important;
    box-sizing: border-box !important;
    margin-inline: 0 !important;
    overflow: visible !important;
  }`
    : `
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
  }`;
  const barePreviewCss =
    bare && fillPreview
      ? `${bareZoomWrapBlock}
  @media (max-width: 480px) {
    body[data-sig-preview="bare"]:not([data-sig-editor-lock-rail]) .sig-zoom-wrap {
      zoom: 1.12 !important;
    }
  }
  /*
   * Transparent chrome only on the outer shell from wrapEmailSignatureRootTable (data-sig-root=signature).
   * When a CTA is configured, splitSignatureAndBannerHtml injects the inner layout as the direct child
   * of .sig-zoom-wrap — that root must keep its own background-color (e.g. Layout 10 dark card).
   */
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][data-sig-root="signature"] {
    max-width: 100% !important;
    background-color: transparent !important;
    background-image: none !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:470px"] {
    width: 470px !important;
    max-width: 470px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:560px"] {
    width: 560px !important;
    max-width: 560px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:520px"] {
    width: 520px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:521px"] {
    width: 521px !important;
    max-width: 521px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:521px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:521px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 521px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:521px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 521px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:521px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:521px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 521px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:521px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 521px !important;
    box-sizing: border-box;
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
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:600px"] {
    width: 600px !important;
    max-width: 600px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:640px"] {
    width: 640px !important;
    max-width: 640px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:620px"] {
    width: 620px !important;
    max-width: 620px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:484px"] {
    width: 484px !important;
    max-width: 484px !important;
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
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:620px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:620px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 620px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:620px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 620px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:484px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:484px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 484px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:484px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 484px !important;
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
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:800px"] {
    width: 800px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="width:800px"] {
    width: 800px !important;
    max-width: 800px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:800px"] td[data-sig-part="signature"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:800px"] td[data-sig-part="banner"] {
    width: 100% !important;
    max-width: 800px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][style*="max-width:800px"] td[data-sig-part="banner"] > table[role="presentation"] {
    width: 100% !important;
    max-width: 800px !important;
    box-sizing: border-box;
  }
  /* 8px root spacer tables between signature / CTAs (full-stack single iframe). */
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][data-sig-root="sig-spacer"],
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][data-sig-root="cta-gap"] {
    margin: 0 !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][data-sig-part="banner"][data-sig-cta-slot="1"] {
    margin-bottom: 8px !important;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap > table[role="presentation"][data-sig-part="banner"][data-sig-cta-slot="2"] {
    margin-top: 8px !important;
  }
  /* Sibling bundle tables: 470 / 560 (Layout 2) / 520 / 600 / 800px rails. */
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:470px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:470px"] {
    width: 470px !important;
    max-width: 470px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:560px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:560px"] {
    width: 560px !important;
    max-width: 560px !important;
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
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:800px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:800px"] {
    width: 800px !important;
    max-width: 800px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:640px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:640px"] {
    width: 640px !important;
    max-width: 640px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:620px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:620px"] {
    width: 620px !important;
    max-width: 620px !important;
    box-sizing: border-box;
  }
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="signature"][style*="width:484px"],
  [data-sig-preview="bare"] .sig-zoom-wrap table[data-sig-part="banner"][style*="width:484px"] {
    width: 484px !important;
    max-width: 484px !important;
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
  body[data-sig-preview="bare"][data-sig-editor-lock-rail] {
    align-items: stretch !important;
  }
  /*
   * Body uses column flex + align-items:center. Without stretch + align-self:stretch, .sig-iframe-host
   * shrink-wraps to content width. Signature HTML has wide fixed-width tables; banner-only slots
   * (e.g. blank strip with width:100% tables) stay narrow — dashed placeholder looks ~half the card.
   */
  body[data-sig-preview="bare"][data-sig-editor-lock-rail] .sig-iframe-host {
    align-self: stretch !important;
    align-items: stretch !important;
    width: 100% !important;
    max-width: 100% !important;
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
  const rootOverflow = editorBareLockedRail
    ? `overflow: visible;`
    : fillPreview
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

  /** Google Fonts — Archivo first (Layout 13); rest for gallery / landing previews. */
  const googleFontPreconnect = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;
  const poppinsLink = `${googleFontPreconnect}
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@300;400;600;700&family=Oswald:wght@500;600;700&family=Poppins:wght@300;400;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">`;
  /** Editor bare iframe: skip remote fonts unless Layout 13 / 14 need Archivo (see {@link includeArchivoFont}). */
  const archivoBareLink = `${googleFontPreconnect}
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;
  const montserratBareLink = `${googleFontPreconnect}
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">`;
  const includeArchivoFont = Boolean(options.includeArchivoFont);
  /** Layouts 13–14 (and any HTML that already asks for Archivo) — match server template HTML stacks. */
  const signatureUsesArchivo = /font-family:\s*[^;{]*Archivo/i.test(body);
  const loadArchivoFonts = includeArchivoFont || signatureUsesArchivo;
  /** Layout 17 + any HTML that asks for Montserrat; Layout 18 + markup using Inter — bare iframe font links. */
  const signatureUsesMontserrat = /font-family:\s*[^;{]*Montserrat/i.test(body);
  const signatureUsesInter = /font-family:\s*[^;{]*Inter/i.test(body);
  const archivoStack = "'Archivo',Helvetica,Arial,sans-serif";
  const fontLinks = bare
    ? loadArchivoFonts
      ? archivoBareLink
      : signatureUsesMontserrat || signatureUsesInter
        ? montserratBareLink
        : ''
    : poppinsLink;
  const bodyFontFamily = loadArchivoFonts
    ? archivoStack
    : bare
      ? "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif"
      : "'Montserrat', 'Poppins', 'Roboto', -apple-system, Helvetica, Arial, sans-serif";
  const archivoPreviewCss = loadArchivoFonts
    ? `
  /* Template 13: outer wrappers + juice’d shells may omit per-table font — force Archivo for the whole preview. */
  body[data-sig-archivo-font="1"],
  body[data-sig-archivo-font="1"] .sig-iframe-host,
  body[data-sig-archivo-font="1"] .sig-iframe-host * {
    font-family: 'Archivo', Helvetica, Arial, sans-serif !important;
  }
`
    : '';
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
  ${archivoPreviewCss}
</style>
</head>
<body${bare ? ' data-sig-preview="bare"' : ''}${bare && editorLockRailPx > 0 ? ' data-sig-editor-lock-rail="1"' : ''}${loadArchivoFonts ? ' data-sig-archivo-font="1"' : ''}>
<div class="sig-iframe-host">
${innerHtml}
</div>
</body>
</html>`;
}
