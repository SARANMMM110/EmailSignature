import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { landingPreviewAPI } from '../../lib/api.js';
import { LANDING_PALETTE_SWATCHES, LANDING_TEMPLATE_ROWS } from '../../data/landingPalettes.js';
import { LandingSignatureIframe } from './LandingSignatureIframe.jsx';

const IDS = LANDING_TEMPLATE_ROWS.map((r) => r.id);

function paletteToApi(colors) {
  return {
    primary: colors[0],
    secondary: colors[1],
    accent: colors[2],
    text: colors[3],
  };
}

export function LandingTemplateShowcase() {
  const [paletteIdx, setPaletteIdx] = useState(0);
  const colors = LANDING_PALETTE_SWATCHES[paletteIdx]?.colors || LANDING_PALETTE_SWATCHES[0].colors;
  const [htmlById, setHtmlById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const paletteApi = useMemo(() => paletteToApi(colors), [colors]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await landingPreviewAPI.signatureHtmlBatch({
        templateIds: IDS,
        palette: paletteApi,
      });
      setHtmlById(data?.htmlById || {});
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load previews');
      setHtmlById({});
    } finally {
      setLoading(false);
    }
  }, [paletteApi]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section
      id="templates"
      className="scroll-mt-24 border-t py-[48px] sm:py-[70px] lg:py-[100px]"
      style={{ borderColor: 'var(--border-sm)', background: 'var(--gray-50)' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sb-color-accent)]">
          Templates
        </p>
        <h2
          className="mx-auto mt-3 max-w-3xl text-center text-[28px] font-normal leading-[1.12] tracking-tight text-[var(--gray-950)] sm:text-[36px] md:text-[40px]"
          style={{ fontFamily: 'var(--sb-font-serif)' }}
        >
          Pick your signature. Make it yours.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[var(--text-tertiary)]">
          Every template adapts to your brand colors instantly.
        </p>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <span className="text-sm font-medium text-[var(--gray-600)]">Preview with palette:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {LANDING_PALETTE_SWATCHES.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaletteIdx(i)}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-105"
                style={{
                  borderColor: paletteIdx === i ? 'var(--sb-color-accent)' : 'transparent',
                  background: `conic-gradient(from 0deg, ${p.colors[0]}, ${p.colors[1]}, ${p.colors[2]}, ${p.colors[3]})`,
                }}
                title={p.name}
                aria-label={`Palette ${p.name}`}
              />
            ))}
          </div>
        </div>

        {error ? (
          <p className="mt-6 text-center text-sm text-amber-700">{error}</p>
        ) : null}

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_TEMPLATE_ROWS.map((row) => (
            <div
              key={row.id}
              className="group relative overflow-hidden rounded-2xl border bg-white shadow-md transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[var(--sb-color-accent)] hover:shadow-lg"
              style={{ borderColor: 'var(--border-sm)' }}
            >
              <span className="absolute right-3 top-3 z-10 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                {row.tier}
              </span>
              <div className="p-3 transition-opacity duration-300" style={{ transitionProperty: 'opacity, filter' }}>
                <LandingSignatureIframe
                  html={htmlById[row.id]}
                  className="bg-white"
                  minHeight={loading ? 220 : 240}
                />
              </div>
              <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border-sm)' }}>
                <p className="font-semibold text-[var(--gray-950)]">{row.label}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{row.id}</p>
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/0 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:bg-white/70 group-hover:opacity-100">
                <Link
                  to="/signup"
                  className="rounded-full bg-[var(--sb-color-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-md"
                >
                  Use this template →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-[var(--text-tertiary)]">… and 60+ more templates</p>
        <div className="mt-4 flex justify-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold text-[var(--gray-950)] transition hover:border-[var(--sb-color-accent)] hover:text-[var(--sb-color-accent)]"
            style={{ borderColor: 'var(--border-sm)' }}
          >
            Browse all templates →
          </Link>
        </div>
      </div>
    </section>
  );
}
