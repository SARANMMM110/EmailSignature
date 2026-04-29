/**
 * Client copy of server `ctaBannerImageStyle.js` — keep behavior aligned with exported HTML.
 * @see server/src/lib/ctaBannerImageStyle.js
 */

/**
 * @param {object} opts
 * @param {number} [opts.widthPx]
 * @param {number} [opts.heightPx]
 * @param {boolean} [opts.fluidWidth]
 * @param {number} [opts.borderRadiusPx]
 * @param {string[]} [opts.extra]
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

export function buildCtaBannerImageStyleObject(opts) {
  const s = buildCtaBannerImageStyleString(opts);
  const o = {};
  for (const part of s.split(';')) {
    const i = part.indexOf(':');
    if (i === -1) continue;
    const key = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (!key) continue;
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    o[camel] = val;
  }
  return o;
}
