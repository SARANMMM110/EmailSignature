import { Link } from 'react-router-dom';

const BRAND = 'SignatureBuilder';

const FEATURES = [
  'Unlimited signatures (vs 1 on Free)',
  'Access to all Pro templates',
  'Custom color palettes',
  `Remove "Made with ${BRAND}" badge`,
];

/**
 * Shown when a Free user hits a Pro-only action (2nd signature, Pro template, custom palettes, etc.).
 */
export function UpgradeModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl shadow-blue-900/10 ring-1 ring-slate-200/80">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-40 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #3b5fff, #a78bfa)' }}
        />
        <div className="relative text-center text-4xl" aria-hidden>
          ⭐
        </div>
        <h2
          id="upgrade-modal-title"
          className="relative mt-4 text-center text-2xl font-extrabold tracking-tight text-[#0c1929]"
        >
          Upgrade to Pro
        </h2>
        <p className="relative mt-2 text-center text-sm font-medium text-slate-500">
          Unlock unlimited signatures, Pro templates, and custom colors
        </p>

        <ul className="relative mt-6 space-y-3 text-sm font-medium text-slate-700">
          {FEATURES.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="shrink-0 font-semibold text-emerald-600">✓</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <p className="relative mt-6 text-center text-lg font-extrabold text-[#0c1929]">
          €29/year{' '}
          <span className="text-sm font-semibold text-slate-500">— less than €3/month</span>
        </p>

        <div className="relative mt-6 flex flex-col items-center gap-3">
          <Link
            to="/settings#billing"
            onClick={onClose}
            className="inline-flex w-full max-w-xs items-center justify-center rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{ background: 'linear-gradient(135deg, #3b5fff, #2563eb)' }}
          >
            Upgrade Now
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
