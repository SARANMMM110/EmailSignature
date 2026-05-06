/**
 * Layout 22 — HTML reference (viewBox 1000×260). TL filled curve; portrait halo fades to **cream** leftward
 * so the name-column edge does not clip the circle into a flat vertical seam (opaque name td masks SVG).
 * Gold sweep + inner arc; TL diamond lattice; TR nested arcs; halo sparkles; gutter ticks; layered footer marks.
 * Bottom-right navy wedge is **not** drawn here — it renders above the portrait via
 * `buildTemplate22PhotoBottomOverlaySvg` so it sits visibly on top of the photo.
 * @param {string} ink — #0f1b26 (c2)
 * @param {string} cream — card #f4efe8 (c3); halo outer stops match td bgcolor
 * @param {string} gold — #caa76b (c1)
 * @param {string} ring — halo #e6d7c3
 */
export function buildTemplate22DecoSvg(ink, cream, gold, ring) {
  const i = String(ink || '#0f1b26').trim();
  const c = String(cream || '#f4efe8').trim();
  const g = String(gold || '#caa76b').trim();
  const r = String(ring || '#e6d7c3').trim();

  /** Bottom-centre diamond flecks + dashed segment (replaces solid dot row). */
  let footerMarks = '';
  for (let k = 0; k < 7; k++) {
    const cx = 418 + k * 22;
    const cy = 249;
    footerMarks += `<path d="M${cx},${cy - 4} L${cx + 4},${cy} L${cx},${cy + 4} L${cx - 4},${cy} Z" fill="${g}" opacity="0.85"/>`;
  }
  footerMarks +=
    `<path d="M260,254 H760" fill="none" stroke="${g}" stroke-width="1" stroke-dasharray="6 10" opacity="0.32"/>` +
    `<path d="M288,236 H732" fill="none" stroke="${i}" stroke-width="0.75" stroke-dasharray="4 14" opacity="0.08"/>` +
    `<path d="M232,258 L238,252 M762,252 L768,258" fill="none" stroke="${g}" stroke-width="1.2" opacity="0.28"/>`;

  /** Small diamond lattice on navy (cream strokes). */
  let tlLattice = '';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = 22 + col * 20;
      const cy = 22 + row * 20;
      tlLattice +=
        `<path d="M${cx},${cy - 3} L${cx + 3},${cy} L${cx},${cy + 3} L${cx - 3},${cy} Z" fill="none" stroke="${c}" stroke-width="0.9" opacity="0.45"/>`;
    }
  }

  /** Nested quarter arcs pinned to top-right corner (1000,0). */
  let trArcs = '';
  for (let k = 0; k < 4; k++) {
    const rr = 34 + k * 28;
    trArcs +=
      `<path d="M1000,${rr} A${rr},${rr} 0 0 0 ${1000 - rr},0" fill="none" stroke="${g}" stroke-width="1.1" opacity="${0.13 + k * 0.055}"/>`;
  }

  /** Soft flecks on halo / portrait band (x≥760). */
  let haloSparkles = '';
  const sp = [
    [798, 108],
    [824, 76],
    [862, 122],
    [902, 94],
    [938, 132],
    [878, 58],
    [916, 154],
    [832, 142],
    [954, 108],
    [770, 88],
    [888, 178],
    [928, 72],
  ];
  for (let j = 0; j < sp.length; j++) {
    const [sx, sy] = sp[j];
    const rad = j % 3 === 0 ? 3 : 2.2;
    haloSparkles += `<circle cx="${sx}" cy="${sy}" r="${rad}" fill="${g}" opacity="0.28"/>`;
  }

  /** Gutter strip below TL navy (y≥148) so marks stay visible in transparent column. */
  let gutterMarks = '';
  for (let k = 0; k < 6; k++) {
    const gy = 154 + k * 18;
    gutterMarks += `<circle cx="54" cy="${gy}" r="2.2" fill="${g}" opacity="0.26"/>`;
    gutterMarks += `<line x1="74" y1="${gy - 5}" x2="74" y2="${gy + 5}" stroke="${g}" stroke-width="0.85" opacity="0.2"/>`;
  }

  /** Center ~photo column (name ends ≈77.7% → x≈777); fade to cream before that boundary so the visible arc is smooth. */
  const haloCx = 882;
  const haloCy = 116;
  const haloR = 248;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 260" preserveAspectRatio="none" width="1000" height="260">` +
    `<defs>` +
    `<radialGradient id="t22Halo" gradientUnits="userSpaceOnUse" cx="${haloCx}" cy="${haloCy}" r="${haloR}" spreadMethod="pad">` +
    `<stop offset="0%" stop-color="${r}" stop-opacity="0.97"/>` +
    `<stop offset="26%" stop-color="${r}" stop-opacity="0.62"/>` +
    `<stop offset="42%" stop-color="${r}" stop-opacity="0.22"/>` +
    `<stop offset="54%" stop-color="${c}" stop-opacity="1"/>` +
    `<stop offset="100%" stop-color="${c}" stop-opacity="1"/>` +
    `</radialGradient>` +
    `<radialGradient id="t22HaloInner" gradientUnits="userSpaceOnUse" cx="${haloCx - 6}" cy="${haloCy - 6}" r="112" spreadMethod="pad">` +
    `<stop offset="0%" stop-color="${r}" stop-opacity="0.28"/>` +
    `<stop offset="55%" stop-color="${r}" stop-opacity="0"/>` +
    `<stop offset="100%" stop-color="${r}" stop-opacity="0"/>` +
    `</radialGradient>` +
    `</defs>` +
    `<ellipse cx="${haloCx}" cy="${haloCy}" rx="276" ry="234" fill="url(#t22Halo)"/>` +
    `<ellipse cx="${haloCx - 6}" cy="${haloCy - 6}" rx="148" ry="128" fill="url(#t22HaloInner)"/>` +
    trArcs +
    haloSparkles +
    `<path d="M0,0 L150,0 C40,0 0,40 0,140 Z" fill="${i}"/>` +
    gutterMarks +
    tlLattice +
    `<path d="M738,-12 A268,268 0 0 1 1000,172" fill="none" stroke="${g}" stroke-width="2"/>` +
    `<path d="M752,-4 A252,252 0 0 1 986,158" fill="none" stroke="${g}" stroke-width="1" opacity="0.38"/>` +
    `<path d="M668,28 Q832,8 988,44" fill="none" stroke="${r}" stroke-width="1.25" opacity="0.35"/>` +
    footerMarks +
    `</svg>`
  );
}

/**
 * Navy bottom-right wedge — right edge flush to x=max; viewBox cropped from the left so the fill hugs the photo column’s right side.
 * @param {string} ink — #0f1b26
 */
export function buildTemplate22PhotoBottomOverlaySvg(ink) {
  const i = String(ink || '#0f1b26').trim();
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="22 0 170 82" width="170" height="82" preserveAspectRatio="xMaxYMax meet">` +
    `<path d="M10,82 C90,2 192,2 192,82 Z" fill="${i}"/>` +
    `</svg>`
  );
}

/**
 * Identity column panel — crosshatch, blooms, brackets, rings (`background-image` on name `<td>`).
 */
export function buildTemplate22NamePanelBgSvg(gold, ink, ring) {
  const g = String(gold || '#caa76b').trim();
  const i = String(ink || '#0f1b26').trim();
  const r = String(ring || '#e6d7c3').trim();
  let hatch = '';
  for (let k = -2; k < 14; k++) {
    const x0 = k * 34;
    hatch += `<line x1="${x0}" y1="0" x2="${x0 + 220}" y2="220" stroke="${g}" stroke-width="0.65" opacity="0.055"/>`;
  }
  let cross = '';
  for (let k = -8; k < 10; k++) {
    const x0 = k * 38 + 80;
    cross += `<line x1="${x0}" y1="220" x2="${x0 + 200}" y2="0" stroke="${g}" stroke-width="0.55" opacity="0.04"/>`;
  }
  const bracket =
    `<path d="M318,22 H348 V52" fill="none" stroke="${g}" stroke-width="1.4" opacity="0.26"/>` +
    `<path d="M348,178 V148 H318" fill="none" stroke="${g}" stroke-width="1.4" opacity="0.26"/>` +
    `<path d="M42,28 V58 H72" fill="none" stroke="${g}" stroke-width="1.15" opacity="0.2"/>` +
    `<path d="M72,172 H42 V142" fill="none" stroke="${g}" stroke-width="1.15" opacity="0.2"/>`;
  let gems = '';
  for (let q = 0; q < 9; q++) {
    const gx = 58 + (q % 3) * 108;
    const gy = 44 + Math.floor(q / 3) * 52;
    gems += `<path d="M${gx},${gy - 4} L${gx + 4},${gy} L${gx},${gy + 4} L${gx - 4},${gy} Z" fill="${g}" opacity="0.08"/>`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200">` +
    `<circle cx="272" cy="72" r="72" fill="${r}" opacity="0.12"/>` +
    `<circle cx="292" cy="118" r="48" fill="${r}" opacity="0.1"/>` +
    `<ellipse cx="210" cy="100" rx="88" ry="70" fill="${r}" opacity="0.06"/>` +
    hatch +
    cross +
    gems +
    `<path d="M44,168 Q178,142 312,156" fill="none" stroke="${i}" stroke-width="0.9" opacity="0.07"/>` +
    `<path d="M60,52 Q180,34 300,48" fill="none" stroke="${g}" stroke-width="0.85" opacity="0.14"/>` +
    bracket +
    `<circle cx="336" cy="96" r="28" fill="none" stroke="${g}" stroke-width="1" opacity="0.15"/>` +
    `<circle cx="336" cy="96" r="14" fill="none" stroke="${g}" stroke-width="0.75" opacity="0.18"/>` +
    `<circle cx="336" cy="96" r="36" fill="none" stroke="${r}" stroke-width="0.75" opacity="0.18"/>` +
    `</svg>`
  );
}
