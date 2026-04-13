import { useCallback, useEffect, useMemo, useState } from 'react';
import { landingPreviewAPI } from '../../lib/api.js';
import { LANDING_PALETTE_GRID } from '../../data/landingPalettes.js';
import { LandingSignatureIframe } from './LandingSignatureIframe.jsx';

function toApi(c) {
  return { primary: c[0], secondary: c[1], accent: c[2], text: c[3] };
}

export function LandingPaletteDemoDark() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  const displayIdx = hovered != null ? hovered : active;
  const colors = LANDING_PALETTE_GRID[displayIdx]?.colors || LANDING_PALETTE_GRID[0].colors;
  const paletteApi = useMemo(() => toApi(colors), [colors]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await landingPreviewAPI.signatureHtmlBatch({
        templateIds: ['template_1'],
        palette: paletteApi,
      });
      setHtml(data?.htmlById?.template_1 || '');
    } catch {
      setHtml('');
    } finally {
      setLoading(false);
    }
  }, [paletteApi]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section
      className="border-t py-[48px] sm:py-[70px] lg:py-[100px]"
      style={{ borderColor: 'var(--gray-800)', background: 'var(--gray-950)' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          className="text-center text-[32px] font-normal leading-tight text-white sm:text-[38px] lg:text-[42px]"
          style={{ fontFamily: 'var(--sb-font-serif)' }}
        >
          Watch it transform
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-base text-[var(--gray-400)]">
          Same design. Infinite color combinations.
        </p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
          <div className="grid grid-cols-3 gap-3">
            {LANDING_PALETTE_GRID.map((p, i) => {
              const isActive = i === active;
              return (
                <button
                  key={p.id}
                  type="button"
                  className="rounded-xl border bg-[var(--gray-900)] p-3 text-left transition-all duration-300 hover:scale-[1.03]"
                  style={{
                    borderColor: isActive ? 'var(--sb-color-accent)' : 'var(--gray-800)',
                    transform: isActive ? 'scale(1.03)' : undefined,
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setActive(i)}
                >
                  <div className="flex gap-1">
                    {p.colors.map((c) => (
                      <span key={c} className="h-6 flex-1 rounded-md" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-gray-300">{p.name}</p>
                </button>
              );
            })}
          </div>

          <div>
            <div
              className="rounded-2xl border bg-white p-4 shadow-2xl transition-colors duration-300"
              style={{ borderColor: 'var(--gray-800)' }}
            >
              <LandingSignatureIframe html={loading ? '' : html} minHeight={320} className="bg-white" />
            </div>
            <p className="mt-4 text-center text-sm text-[var(--gray-500)]">Try clicking different palettes →</p>
          </div>
        </div>
      </div>
    </section>
  );
}
