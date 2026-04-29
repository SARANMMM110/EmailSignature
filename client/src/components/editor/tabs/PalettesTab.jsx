import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { FiTrash2 } from 'react-icons/fi';
import { HiOutlineSwatch, HiOutlineXMark } from 'react-icons/hi2';
import { palettesAPI } from '../../../lib/api.js';
import { useEditorStore } from '../../../store/editorStore.js';
import { usePlanGate } from '../../../hooks/usePlanGate.js';
import { useUpgradeModalStore } from '../../../store/upgradeModalStore.js';
import { Button } from '../../ui/Button.jsx';
import { PLANS } from '../../../data/plans.js';
import { Input } from '../../ui/Input.jsx';
import { PaletteSmartControls } from '../palette/PaletteSmartControls.jsx';
import {
  PALETTE_EDITOR_LEGEND_SLOTS,
  PALETTE_LEGEND_CTA_ALIGNMENT,
} from '../../../data/paletteLegend.js';
import { PALETTE_PRESET_THEMES } from '../../../data/palettePresets.js';

function normalizeColors(c) {
  if (!Array.isArray(c) || c.length < 4) return null;
  const out = c.slice(0, 4).map((x) => String(x).trim().toLowerCase());
  if (!out[0] || !out[1]) return null;
  return out;
}

function colorsKey(colors) {
  const n = normalizeColors(colors);
  return n ? JSON.stringify(n) : '';
}

/** Same merge as `signatureToEditorPayload` so the highlighted card matches server/API rows that omit `design.colors`. */
function designColorsKeyFromSignatureDesign(design) {
  if (!design) return '';
  const colors = Array.isArray(design.colors) ? design.colors : [];
  const pal = design.palette || {};
  return colorsKey([
    colors[0] ?? pal.primary,
    colors[1] ?? pal.secondary,
    colors[2] ?? pal.accent ?? '#64748b',
    colors[3] ?? pal.text ?? '#0f172a',
  ]);
}

/** Swatch strip order: matches colour legend (background, secondary, text, icon/label). */
function swatchesInLegendOrder(cols) {
  const c = normalizeColors(cols) || cols;
  return PALETTE_EDITOR_LEGEND_SLOTS.map((s) => c[s.engineIndex]).filter(Boolean);
}

export function PalettesTab() {
  const navigate = useNavigate();
  const gate = usePlanGate();
  const showUpgradeModal = useUpgradeModalStore((s) => s.showUpgradeModal);
  const signature = useEditorStore((s) => s.signature);
  const setPalette = useEditorStore((s) => s.setPalette);
  const resetPaletteToLayoutDefaults = useEditorStore((s) => s.resetPaletteToLayoutDefaults);
  const editorSaving = useEditorStore((s) => s.isSaving);
  const [system, setSystem] = useState([]);
  const [user, setUser] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('My palette');
  const [c1, setC1] = useState('#2563eb');
  const [c2, setC2] = useState('#1e40af');
  const [c3, setC3] = useState('#64748b');
  const [c4, setC4] = useState('#0f172a');
  const [saving, setSaving] = useState(false);
  /** Colour legend (fine-tune) only after user picks a palette; shown inline under that card. */
  const [legendOpen, setLegendOpen] = useState(false);
  const [legendAnchorKey, setLegendAnchorKey] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [sysRes, userRes] = await Promise.all([
          palettesAPI.getSystem(),
          palettesAPI.getUser(),
        ]);
        setSystem(sysRes.data?.palettes || []);
        setUser(userRes.data?.palettes || []);
      } catch {
        setSystem([]);
        setUser([]);
      }
    })();
  }, []);

  useEffect(() => {
    setLegendOpen(false);
    setLegendAnchorKey(null);
  }, [signature?.id]);

  const applyPaletteFromChooser = useCallback(
    (anchorKey, cols) => {
      setLegendAnchorKey(anchorKey);
      setLegendOpen(true);
      setPalette(cols);
    },
    [setPalette]
  );

  const selectedKey = useMemo(
    () => designColorsKeyFromSignatureDesign(signature?.design),
    [signature?.design]
  );

  const paletteItems = useMemo(() => {
    const items = [];
    for (const preset of PALETTE_PRESET_THEMES) {
      items.push({ kind: 'preset', key: `preset:${preset.id}`, preset });
    }
    for (const p of system) items.push({ kind: 'library', key: `sys:${p.id}`, p, isUser: false });
    for (const p of user) items.push({ kind: 'library', key: `user:${p.id}`, p, isUser: true });
    return items;
  }, [system, user]);

  const openAddPalette = () => {
    if (!gate.can('custom_palette_creation')) {
      showUpgradeModal({
        feature: 'custom_palette_creation',
        requiredPlan: 'advanced',
        title: `Custom Palettes — ${PLANS.advanced.name} feature`,
        message: 'Create custom color palettes to match your exact brand colors.',
      });
      return;
    }
    if (gate.isAtLimit('max_saved_custom_palettes', user.length)) {
      showUpgradeModal({
        feature: 'max_saved_custom_palettes',
        requiredPlan: gate.planId === 'advanced' ? 'ultimate' : 'advanced',
        message: `Your ${gate.plan.name} plan allows up to ${gate.limitText('max_saved_custom_palettes')} custom palettes.`,
      });
      return;
    }
    setShowAdd((s) => !s);
  };

  const handleSaveNew = async () => {
    if (!gate.can('custom_palette_creation')) {
      showUpgradeModal({
        feature: 'custom_palette_creation',
        requiredPlan: 'advanced',
        title: `Custom Palettes — ${PLANS.advanced.name} feature`,
        message: 'Create custom color palettes to match your exact brand colors.',
      });
      return;
    }
    if (gate.isAtLimit('max_saved_custom_palettes', user.length)) {
      showUpgradeModal({
        feature: 'max_saved_custom_palettes',
        requiredPlan: gate.planId === 'advanced' ? 'ultimate' : 'advanced',
        message: `Your ${gate.plan.name} plan allows up to ${gate.limitText('max_saved_custom_palettes')} custom palettes.`,
      });
      return;
    }
    const colors = [c1, c2, c3, c4];
    setSaving(true);
    try {
      const createRes = await palettesAPI.create({ name: newName.trim() || 'My palette', colors });
      const { data } = await palettesAPI.getUser();
      const list = data?.palettes || [];
      setUser(list);
      const newId = createRes.data?.palette?.id;
      const keyFromList =
        !newId && list.length
          ? list.find((row) => colorsKey(row.colors) === colorsKey(colors))?.id
          : null;
      const anchorId = newId || keyFromList;
      if (anchorId) setLegendAnchorKey(`user:${anchorId}`);
      setLegendOpen(true);
      setPalette(colors);
      setShowAdd(false);
    } catch {
      /* toast from parent optional */
    } finally {
      setSaving(false);
    }
  };

  const closeColourLegend = useCallback(() => {
    setLegendOpen(false);
    setLegendAnchorKey(null);
  }, []);

  /** Trash only clears applied brand colours from the signature (keeps saved custom palettes in “Your palettes”). */
  const handlePaletteDelete = (_p, _isUser, cols) => {
    const key = colorsKey(cols);
    if (key && key === selectedKey) resetPaletteToLayoutDefaults();
  };

  const PresetPaletteCard = ({ preset, anchorKey }) => {
    const cols = normalizeColors(preset.colors) || preset.colors;
    const active = colorsKey(cols) === selectedKey;
    const removeColorsDisabled = !active;

    return (
      <div
        className={`relative w-full rounded-xl border-2 bg-white transition hover:shadow-md ${
          active ? 'border-[#3b5bdb] ring-2 ring-[#3b5bdb]/20' : 'border-slate-200'
        }`}
      >
        <button
          type="button"
          disabled={editorSaving}
          onClick={() => applyPaletteFromChooser(anchorKey, cols)}
          className="w-full rounded-xl p-3 pr-11 text-left transition disabled:opacity-50 sm:pr-10"
        >
          <div className="mb-2 flex gap-1">
            {swatchesInLegendOrder(cols).map((c, i) => (
              <span
                key={i}
                className="h-8 w-8 rounded-md border border-white shadow-sm ring-1 ring-slate-200/80 sm:h-9 sm:w-9"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{preset.name}</p>
            <p className="mt-0.5 text-[10px] font-medium text-[#3b5bdb]">Starter</p>
            {preset.tagline ? (
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500">{preset.tagline}</p>
            ) : null}
          </div>
        </button>
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            title={
              active
                ? 'Remove colours from signature (saved palettes stay in your list)'
                : 'Select this palette first to remove its colours from your signature'
            }
            disabled={editorSaving || removeColorsDisabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePaletteDelete(null, false, cols);
            }}
            className="rounded-lg border border-slate-200 bg-white/95 p-1.5 text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-40"
          >
            <FiTrash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  };

  const PaletteCard = ({ p, isUser, anchorKey }) => {
    const raw = Array.isArray(p.colors) && p.colors.length >= 4 ? p.colors : null;
    const cols = normalizeColors(raw) || ['#ccc', '#999', '#eee', '#fff'];
    const active = colorsKey(cols) === selectedKey;
    const removeColorsDisabled = !active;

    return (
      <div
        className={`relative w-full rounded-xl border-2 bg-white transition hover:shadow-md ${
          active ? 'border-[#3b5bdb] ring-2 ring-[#3b5bdb]/20' : 'border-slate-200'
        }`}
      >
        <button
          type="button"
          disabled={editorSaving}
          onClick={() => applyPaletteFromChooser(anchorKey, cols)}
          className="w-full rounded-xl p-3 pr-11 text-left transition disabled:opacity-50 sm:pr-10"
        >
          <div className="mb-2 flex gap-1">
            {swatchesInLegendOrder(cols).map((c, i) => (
              <span
                key={i}
                className="h-8 w-8 rounded-md border border-white shadow-sm ring-1 ring-slate-200/80 sm:h-9 sm:w-9"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
            {isUser ? <p className="text-[10px] text-slate-400">Custom</p> : null}
          </div>
        </button>
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            title={
              active
                ? 'Remove colours from signature (saved palettes stay in your list)'
                : 'Select this palette first to remove its colours from your signature'
            }
            disabled={editorSaving || removeColorsDisabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePaletteDelete(p, isUser, cols);
            }}
            className="rounded-lg border border-slate-200 bg-white/95 p-1.5 text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-40"
          >
            <FiTrash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm sm:p-5">
        <div className="border-b border-slate-200/80 pb-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Palettes</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600">
            Choose one palette for this signature — the colour legend opens under the card you tap so you can
            fine-tune roles.
          </p>
          {gate.planId !== 'ultimate' && gate.can('custom_palette_creation') ? (
            <p className="mt-1.5 text-[11px] font-medium text-slate-500">
              {user.length} / {gate.limitText('max_saved_custom_palettes')} saved custom palettes
            </p>
          ) : null}
        </div>

        {!signature ? (
          <p className="py-8 text-center text-sm text-slate-500">Load a signature to edit colours.</p>
        ) : (
          <>
            <section className="mt-6">


              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={openAddPalette}
                  className="text-sm font-semibold text-[#3b5bdb] hover:underline"
                >
                  {showAdd ? 'Cancel' : '+ Add custom'}
                </button>
                {!gate.can('custom_palette_creation') ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-slate-500 hover:text-[#2563eb] hover:underline"
                    onClick={() => navigate('/settings#plan')}
                  >
                    View plans →
                  </button>
                ) : null}
              </div>

              {showAdd && (
                <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/90 p-4">
                  <h4 className="text-sm font-semibold text-slate-900">New palette from current colours</h4>
                  <Input label="Palette name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {PALETTE_EDITOR_LEGEND_SLOTS.map((slot) => {
                      const val = [c1, c2, c3, c4][slot.engineIndex];
                      const set = [setC1, setC2, setC3, setC4][slot.engineIndex];
                      return (
                        <div key={slot.id} className="rounded-lg border border-slate-200/80 bg-white p-2">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#3b5bdb]">
                            {slot.title}
                          </p>
                          <p className="mb-1 text-[9px] leading-snug text-slate-500">{slot.short}</p>
                          <HexColorPicker color={val} onChange={set} style={{ width: '100%', height: 100 }} />
                        </div>
                      );
                    })}
                  </div>
                  <Button type="button" className="!bg-[#3b5bdb]" disabled={saving} onClick={handleSaveNew}>
                    Save palette
                  </Button>
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {paletteItems.flatMap((item) => {
                  const card =
                    item.kind === 'preset' ? (
                      <PresetPaletteCard key={item.key} preset={item.preset} anchorKey={item.key} />
                    ) : (
                      <PaletteCard key={item.key} p={item.p} isUser={item.isUser} anchorKey={item.key} />
                    );
                  if (!legendOpen || legendAnchorKey !== item.key) return [card];
                  return [
                    card,
                    <div
                      key={`${item.key}-legend`}
                      className="col-span-1 min-w-0 sm:col-span-2"
                    >
                      <div className="rounded-2xl border border-[#3b5bdb]/25 bg-gradient-to-br from-white via-white to-[#3b5bdb]/[0.07] p-[1px] shadow-[0_16px_48px_-20px_rgba(37,99,235,0.35)]">
                        <div className="rounded-[15px] bg-white/95 px-4 py-5 sm:px-6 sm:py-6">
                          <header className="mb-5 border-b border-slate-100 pb-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-2.5">
                                <span
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3b5bdb]/10 text-[#3b5bdb]"
                                  aria-hidden
                                >
                                  <HiOutlineSwatch className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                  <h3 className="text-base font-bold tracking-tight text-slate-900">Colour legend</h3>
                                  <p className="mt-0.5 max-w-2xl text-[11px] leading-relaxed text-slate-600">
                                    Swatches 1–4: background 1 (primary), background 2 (secondary), text, labels
                                    and icons (accent).{' '}
                                    <span className="text-slate-500">{PALETTE_LEGEND_CTA_ALIGNMENT}</span>
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={closeColourLegend}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                title="Close colour legend"
                                aria-label="Close colour legend"
                              >
                                <HiOutlineXMark className="h-5 w-5" strokeWidth={2} aria-hidden />
                              </button>
                            </div>
                          </header>
                          <PaletteSmartControls embedded embeddedChrome="inline" />
                        </div>
                      </div>
                    </div>,
                  ];
                })}
              </div>

              {!legendOpen ? (
                <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-500">
                  Tap a palette card to apply it — the legend appears right under that card.
                </p>
              ) : null}
            </section>
          </>
        )}
      </div>
    </>
  );
}
