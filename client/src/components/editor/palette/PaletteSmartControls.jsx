import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { HiOutlineArrowPath, HiOutlineSparkles } from 'react-icons/hi2';
import { useEditorStore } from '../../../store/editorStore.js';
import { resolvePaletteColorsFromDesign } from '../../../lib/resolveDesignPalette.js';
import { normalizeHex, polishPaletteFour } from '../../../lib/paletteContrast.js';
import {
  PALETTE_EDITOR_LEGEND_SLOTS,
  PALETTE_LEGEND_CTA_ALIGNMENT,
} from '../../../data/paletteLegend.js';
import { Button } from '../../ui/Button.jsx';

function colorsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length < 4 || b.length < 4) return false;
  return a.slice(0, 4).every((c, i) => normalizeHex(c) === normalizeHex(b[i]));
}

/**
 * @param {{ embedded?: boolean; embeddedChrome?: 'default' | 'inline' }} [props] — `embedded`: PalettesTab inline legend; `embeddedChrome` tweaks density when embedded.
 */
export function PaletteSmartControls({ embedded = false, embeddedChrome = 'default' }) {
  const signature = useEditorStore((s) => s.signature);
  const setPalette = useEditorStore((s) => s.setPalette);
  const resetPaletteToLayoutDefaults = useEditorStore((s) => s.resetPaletteToLayoutDefaults);

  const engineColors = useMemo(
    () => resolvePaletteColorsFromDesign(signature?.design),
    [signature?.design]
  );

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const gestureArmed = useRef(false);

  const pushHistory = useCallback(() => {
    setPast((p) => [...p.slice(-24), [...engineColors]]);
    setFuture([]);
  }, [engineColors]);

  const beginColorGesture = useCallback(() => {
    if (gestureArmed.current) return;
    gestureArmed.current = true;
    pushHistory();
  }, [pushHistory]);

  const endColorGesture = useCallback(() => {
    gestureArmed.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', endColorGesture);
    window.addEventListener('pointercancel', endColorGesture);
    return () => {
      window.removeEventListener('pointerup', endColorGesture);
      window.removeEventListener('pointercancel', endColorGesture);
    };
  }, [endColorGesture]);

  const applyEngineStop = useCallback(
    (index, hex) => {
      const h = normalizeHex(hex);
      const next = [...engineColors];
      if (normalizeHex(next[index]) === h) return;
      next[index] = h;
      setPalette(next);
    },
    [engineColors, setPalette]
  );

  const handlePolishContrast = () => {
    pushHistory();
    const out = polishPaletteFour([...engineColors]);
    if (!colorsEqual(out, engineColors)) setPalette(out);
  };

  const handleUndo = () => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [[...engineColors], ...f]);
    setPalette(prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const [head, ...rest] = future;
    setFuture(rest);
    setPast((p) => [...p, [...engineColors]]);
    setPalette(head);
  };

  const legendRows = PALETTE_EDITOR_LEGEND_SLOTS.map((slot) => ({
    id: slot.id,
    title: slot.title,
    short: slot.short,
    description: slot.description,
    value: engineColors[slot.engineIndex] ?? '#000000',
    onChange: (hex) => applyEngineStop(slot.engineIndex, hex),
  }));

  const intro = embedded ? null : (
    <div>
      <h3 className="text-sm font-bold text-slate-900">Signature colors</h3>
      <p className="mt-0.5 max-w-xl text-[11px] leading-relaxed text-slate-500">
        {PALETTE_LEGEND_CTA_ALIGNMENT}
      </p>
    </div>
  );

  const inline = embedded && embeddedChrome === 'inline';
  const roleCardClass = inline
    ? 'rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm ring-1 ring-slate-100/60 sm:p-4'
    : 'rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm ring-1 ring-slate-100/80';
  const pickerH = inline ? 108 : 120;

  const body = (
    <div className={inline ? 'space-y-4' : 'space-y-5'}>
      {intro}

      <div className={`grid grid-cols-1 gap-3 ${inline ? 'sm:gap-4' : 'gap-4'}`}>
        {legendRows.map((row) => (
          <div key={row.id} className={roleCardClass} onPointerDownCapture={beginColorGesture}>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#3b5bdb]">
              {row.title}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{row.short}</p>
            <p className={`leading-snug text-slate-600 ${inline ? 'mt-1 text-[10px]' : 'mt-1 text-[11px]'}`}>
              {row.description}
            </p>
            <div className={inline ? 'mt-2.5' : 'mt-3'} onPointerDownCapture={beginColorGesture}>
              <HexColorPicker
                color={normalizeHex(row.value)}
                onChange={row.onChange}
                style={{ width: '100%', height: pickerH }}
              />
            </div>
            <label className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Hex
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-[#3b5bdb] focus:outline-none focus:ring-1 focus:ring-[#3b5bdb]/30"
              value={normalizeHex(row.value)}
              spellCheck={false}
              onPointerDown={beginColorGesture}
              onBlur={endColorGesture}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (/^#?[0-9a-fA-F]{3,8}$/.test(v)) row.onChange(v.startsWith('#') ? v : `#${v}`);
              }}
              aria-label={`${row.title} hex value`}
            />
          </div>
        ))}
      </div>

      <div
        className={
          inline
            ? 'flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2'
            : 'flex flex-wrap gap-2 border-t border-slate-200/80 pt-4'
        }
      >
        <Button type="button" variant="secondary" disabled={past.length === 0} onClick={handleUndo}>
          Undo
        </Button>
        <Button type="button" variant="secondary" disabled={future.length === 0} onClick={handleRedo}>
          Redo
        </Button>
        <Button type="button" variant="ghost" onClick={() => resetPaletteToLayoutDefaults()}>
          <HiOutlineArrowPath className="mr-1 inline h-4 w-4" aria-hidden />
          Reset to layout defaults
        </Button>
      </div>
    </div>
  );

  if (embedded) {
    return <div className={inline ? '' : 'pt-2'}>{body}</div>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm sm:p-5">
      {body}
    </div>
  );
}
