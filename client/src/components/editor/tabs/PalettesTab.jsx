import { useEffect, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { palettesAPI } from '../../../lib/api.js';
import { useEditorStore } from '../../../store/editorStore.js';
import { Button } from '../../ui/Button.jsx';
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
  const signature = useEditorStore((s) => s.signature);
  const setPalette = useEditorStore((s) => s.setPalette);
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

  const handleSaveNew = async () => {
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

  const PaletteCard = ({ p, isUser }) => {
    const raw = Array.isArray(p.colors) && p.colors.length >= 4 ? p.colors : null;
    const cols = normalizeColors(raw) || ['#ccc', '#999', '#eee', '#fff'];
    const active = colorsKey(cols) === selectedKey;
    return (
      <button
        type="button"
        disabled={editorSaving}
        onClick={() => setPalette(cols)}
        className={`w-full rounded-xl border-2 bg-white p-3 text-left transition hover:shadow-md disabled:opacity-50 ${
          active ? 'border-[#3b5bdb] ring-2 ring-[#3b5bdb]/20' : 'border-slate-200'
        } ${view === 'list' ? 'flex items-center gap-3' : ''}`}
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
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
          {isUser && <p className="text-[10px] text-slate-400">Custom</p>}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">Palettes</h2>
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

      <button
        type="button"
        onClick={() => setShowAdd((s) => !s)}
        className="text-sm font-semibold text-[#3b5bdb] hover:underline"
      >
        {showAdd ? '− Cancel' : '+ Add palette'}
      </button>

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
