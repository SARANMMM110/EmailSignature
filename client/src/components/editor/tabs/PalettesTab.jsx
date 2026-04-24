import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { palettesAPI } from '../../../lib/api.js';
import { useEditorStore } from '../../../store/editorStore.js';
import { usePlanGate } from '../../../hooks/usePlanGate.js';
import { useUpgradeModalStore } from '../../../store/upgradeModalStore.js';
import { Button } from '../../ui/Button.jsx';
import { Modal } from '../../ui/Modal.jsx';
import { PLANS } from '../../../data/plans.js';
import { Input } from '../../ui/Input.jsx';

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
  const [view, setView] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterQ, setFilterQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('My palette');
  const [c1, setC1] = useState('#2563eb');
  const [c2, setC2] = useState('#1e40af');
  const [c3, setC3] = useState('#64748b');
  const [c4, setC4] = useState('#0f172a');
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editIsUser, setEditIsUser] = useState(false);
  const [editName, setEditName] = useState('');
  const [e1, setE1] = useState('#2563eb');
  const [e2, setE2] = useState('#1e40af');
  const [e3, setE3] = useState('#64748b');
  const [e4, setE4] = useState('#0f172a');

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

  const selectedKey = useMemo(
    () => designColorsKeyFromSignatureDesign(signature?.design),
    [signature?.design]
  );

  const filteredSystem = useMemo(() => {
    const q = filterQ.trim().toLowerCase();
    if (!q) return system;
    return system.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [system, filterQ]);

  const filteredUser = useMemo(() => {
    const q = filterQ.trim().toLowerCase();
    if (!q) return user;
    return user.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [user, filterQ]);

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
      await palettesAPI.create({ name: newName.trim() || 'My palette', colors });
      const { data } = await palettesAPI.getUser();
      setUser(data?.palettes || []);
      setPalette(colors);
      setShowAdd(false);
    } catch {
      /* toast from parent optional */
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (p, isUser, cols) => {
    setEditRowId(p.id);
    setEditIsUser(!!isUser);
    setEditName(String(p.name || '').trim() || 'Palette');
    setE1(cols[0]);
    setE2(cols[1]);
    setE3(cols[2]);
    setE4(cols[3]);
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditRowId(null);
  };

  const handleSaveEdit = async () => {
    const colors = normalizeColors([e1, e2, e3, e4]);
    if (!colors) return;
    if (editIsUser && editRowId) {
      if (!gate.can('custom_palette_creation')) {
        showUpgradeModal({
          feature: 'custom_palette_creation',
          requiredPlan: 'advanced',
          title: `Custom Palettes — ${PLANS.advanced.name} feature`,
          message: 'Create custom color palettes to match your exact brand colors.',
        });
        return;
      }
      setEditSaving(true);
      try {
        await palettesAPI.update(editRowId, {
          name: editName.trim() || 'My palette',
          colors,
        });
        const { data } = await palettesAPI.getUser();
        setUser(data?.palettes || []);
      } catch {
        setEditSaving(false);
        return;
      } finally {
        setEditSaving(false);
      }
    }
    setPalette(colors);
    closeEditModal();
  };

  /** Trash only clears applied brand colors from the signature (keeps saved custom palettes in “Your palettes”). */
  const handlePaletteDelete = (_p, _isUser, cols) => {
    const key = colorsKey(cols);
    if (key && key === selectedKey) resetPaletteToLayoutDefaults();
  };

  const PaletteCard = ({ p, isUser }) => {
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
          onClick={() => setPalette(cols)}
          className={`w-full rounded-xl p-3 pb-10 text-left transition disabled:opacity-50 sm:pb-3 ${
            view === 'list' ? 'flex items-center gap-3' : ''
          }`}
        >
          <div className={`flex gap-1 ${view === 'list' ? 'shrink-0' : 'mb-2'}`}>
            {cols.map((c, i) => (
              <span
                key={i}
                className="h-8 w-8 rounded-md border border-white shadow-sm ring-1 ring-slate-200/80 sm:h-9 sm:w-9"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="min-w-0 pr-16 sm:pr-14">
            <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
            {isUser ? <p className="text-[10px] text-slate-400">Custom</p> : null}
          </div>
        </button>
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            title="Edit palette"
            disabled={editorSaving}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openEditModal(p, isUser, cols);
            }}
            className="rounded-lg border border-slate-200 bg-white/95 p-1.5 text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-40"
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
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
    <div className="space-y-4">
      <Modal
        open={editOpen}
        onClose={closeEditModal}
        title={editIsUser ? 'Edit custom palette' : 'Edit palette'}
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button type="button" className="!bg-[#3b5bdb]" disabled={editSaving} onClick={handleSaveEdit}>
              {editSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {editIsUser ? (
            <Input label="Palette name" value={editName} onChange={(e) => setEditName(e.target.value)} />
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-500">Color 1</p>
              <HexColorPicker color={e1} onChange={setE1} style={{ width: '100%', height: 100 }} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-500">Color 2</p>
              <HexColorPicker color={e2} onChange={setE2} style={{ width: '100%', height: 100 }} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-500">Color 3</p>
              <HexColorPicker color={e3} onChange={setE3} style={{ width: '100%', height: 100 }} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-500">Color 4</p>
              <HexColorPicker color={e4} onChange={setE4} style={{ width: '100%', height: 100 }} />
            </div>
          </div>
        </div>
      </Modal>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900">Palettes</h2>
          {gate.planId !== 'ultimate' && gate.can('custom_palette_creation') ? (
            <span className="text-[11px] font-medium text-slate-400">
              {user.length} / {gate.limitText('max_saved_custom_palettes')} palettes
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Grid view"
            onClick={() => setView('grid')}
            className={`rounded-lg p-2 ${view === 'grid' ? 'bg-blue-50 text-[#3b5bdb]' : 'text-slate-500'}`}
          >
            ⊞
          </button>
          <button
            type="button"
            title="List view"
            onClick={() => setView('list')}
            className={`rounded-lg p-2 ${view === 'list' ? 'bg-blue-50 text-[#3b5bdb]' : 'text-slate-500'}`}
          >
            ☰
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Filters
            </button>
            {filterOpen && (
              <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <label className="text-[10px] font-semibold uppercase text-slate-500">Search</label>
                <input
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                  placeholder="Filter by name…"
                  value={filterQ}
                  onChange={(e) => setFilterQ(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={openAddPalette} className="text-sm font-semibold text-[#3b5bdb] hover:underline">
          {showAdd ? '− Cancel' : '+ Add palette'}
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
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <Input label="Palette name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-500">Color 1</p>
              <HexColorPicker color={c1} onChange={setC1} style={{ width: '100%', height: 100 }} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-500">Color 2</p>
              <HexColorPicker color={c2} onChange={setC2} style={{ width: '100%', height: 100 }} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-500">Color 3</p>
              <HexColorPicker color={c3} onChange={setC3} style={{ width: '100%', height: 100 }} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-500">Color 4</p>
              <HexColorPicker color={c4} onChange={setC4} style={{ width: '100%', height: 100 }} />
            </div>
          </div>
          <Button type="button" className="!bg-[#3b5bdb]" disabled={saving} onClick={handleSaveNew}>
            Save palette
          </Button>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">System</p>
        <div className={view === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : 'space-y-2'}>
          {filteredSystem.map((p) => (
            <PaletteCard key={p.id} p={p} />
          ))}
        </div>
      </div>

      {filteredUser.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Your palettes</p>
          <div className={view === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : 'space-y-2'}>
            {filteredUser.map((p) => (
              <PaletteCard key={p.id} p={p} isUser />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
