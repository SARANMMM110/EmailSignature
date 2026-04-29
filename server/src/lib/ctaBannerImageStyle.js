/**
 * Email-safe inline styles for CTA banner `<img>` slots — shared by server HTML + editor preview (client copy).
 * Fixed box dimensions (width/height attributes) stay on the `<img>`; this string is the `style="…"` body.
 * Always `object-fit:contain` and centered so the full uploaded image is visible in the slot.
 */

/**
 * @param {object} opts
 * @param {number} [opts.widthPx] — fixed width (omit if fluidWidth)
 * @param {number} [opts.heightPx]
 * @param {boolean} [opts.fluidWidth] — width:100%; max-width:100% inside fixed-height cell
 * @param {number} [opts.borderRadiusPx]
 * @param {string[]} [opts.extra] — extra declarations (no trailing semicolons)
 */
export function buildCtaBannerImageStyleString(opts = {}) {
  const heightPx = Math.max(1, Math.round(Number(opts.heightPx) || 1));
  const fit = 'contain';
  const px = 50;
  const py = 50;
  const fluid = Boolean(opts.fluidWidth);
  const widthPx = Math.max(1, Math.round(Number(opts.widthPx) || 1));

  const parts = [
    'display:block',
    ...(fluid
      ? ['width:100%', 'max-width:100%']
      : [`width:${widthPx}px`, 'max-width:100%']),
    `height:${heightPx}px`,
    `min-height:${heightPx}px`,
    `max-height:${heightPx}px`,
    `object-fit:${fit}`,
    `object-position:${px}% ${py}%`,
    'border:0',
    'vertical-align:middle',
    '-ms-interpolation-mode:bicubic',
  ];

  const r = opts.borderRadiusPx != null ? Math.round(Number(opts.borderRadiusPx)) : null;
  if (r != null && Number.isFinite(r) && r > 0) {
    parts.push(`border-radius:${r}px`);
    parts.push(`-webkit-border-radius:${r}px`);
  }

  if (Array.isArray(opts.extra)) {
    for (const e of opts.extra) {
      if (e) parts.push(String(e));
    }
  }

  return parts.join(';');
}

/**
 * Small rail / logo images: max box, intrinsic scaling (email clients).
 */
export function buildCtaBannerLogoRailStyleString(_banner, opts = {}) {
  const fit = 'contain';
  const px = 50;
  const py = 50;
  const maxW = Math.max(40, Math.round(Number(opts.maxWidthPx) || 110));
  const maxH = Math.max(16, Math.round(Number(opts.maxHeightPx) || 30));
  const parts = [
    /* inline-block + width:auto so parent `text-align:center` centers the logo (block + width:100% hugged the left edge). */
    'display:inline-block',
    'vertical-align:middle',
    'width:auto',
    `max-width:${maxW}px`,
    'height:auto',
    `max-height:${maxH}px`,
    `object-fit:${fit}`,
    `object-position:${px}% ${py}%`,
    'margin:0 0 4px 0',
    'border:0',
    'line-height:0',
  ];
  return parts.join(';');
}
