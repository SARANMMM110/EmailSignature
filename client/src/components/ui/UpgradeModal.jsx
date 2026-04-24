import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PLANS, PLAN_ORDER, PLAN_IDS, normalizePlanId, minPlanForFeature } from '../../data/plans.js';
import { useUpgradeModalStore } from '../../store/upgradeModalStore.js';
import { usePlanGate } from '../../hooks/usePlanGate.js';
import { BRAND_NAME } from '../../constants/brand.js';

const FEATURE_HEADLINE = {
  max_active_signatures: 'More active signatures',
  custom_palette_creation: 'Custom brand palettes',
  max_saved_custom_palettes: 'More saved palettes',
  layout_templates: 'More layout templates',
  cta_banner_templates: 'CTA banner templates',
  premium_banner_presets: 'Premium banner designs',
  custom_banner_image_upload: 'Custom banner images',
  whole_sig_clickthrough_url: 'Clickable signature',
  png_rich_clipboard_render: 'PNG clipboard export',
  hosted_png_image_url_flow: 'Hosted image URL',
  hide_made_with_badge: `Remove ${BRAND_NAME} branding`,
  media_upload_limit_mb: 'Larger uploads',
};

const ADVANCED_BULLETS = [
  'Up to 10 active signatures',
  '10 layout templates',
  'Custom palettes (5 saved)',
  '5 CTA banner styles',
  'Custom banner upload',
  'Add redirect link on your signature',
  '10MB media uploads',
  'Copy HTML, download PNG, all install guides',
  `Hide “Made with ${BRAND_NAME}” badge`,
];

const ULTIMATE_BULLETS = [
  'Unlimited active signatures & saved palettes',
  '20+ layout templates',
  'All CTA banner styles',
  '25MB media uploads',
  `Everything in ${PLANS.advanced.name}, plus unlimited scale`,
];

function planCardsToShow(requiredPlanId, currentPlanId) {
  const req = normalizePlanId(requiredPlanId || PLAN_IDS.ADVANCED);
  const cur = normalizePlanId(currentPlanId);
  const iReq = PLAN_ORDER.indexOf(req);
  const iCur = PLAN_ORDER.indexOf(cur);
  const out = [];
  for (const id of PLAN_ORDER) {
    if (id === PLAN_IDS.PERSONAL) continue;
    const iId = PLAN_ORDER.indexOf(id);
    if (iId >= iReq && iId > iCur) out.push(id);
  }
  return out;
}

export function UpgradeModal() {
  const navigate = useNavigate();
  const { open, featureKey, title, message, requiredPlanId, hideUpgradeModal } = useUpgradeModalStore();
  const { planId: currentPlanId } = usePlanGate();

  const effectiveRequired = requiredPlanId
    ? normalizePlanId(requiredPlanId)
    : featureKey
      ? minPlanForFeature(featureKey)
      : 'advanced';

  const cards = useMemo(
    () => planCardsToShow(effectiveRequired, currentPlanId),
    [effectiveRequired, currentPlanId]
  );

  const accentPlan = PLANS[effectiveRequired] || PLANS.advanced;
  const headline =
    title ||
    (featureKey && FEATURE_HEADLINE[featureKey]
      ? `Unlock ${FEATURE_HEADLINE[featureKey]}`
      : 'Upgrade your plan');

  const sub =
    message ||
    'Choose a plan that fits your workflow. You can change or cancel any time.';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60"
        aria-label="Close"
        onClick={() => hideUpgradeModal()}
      />
      <div
        className="relative w-full max-w-[480px] overflow-hidden rounded-[24px] bg-white shadow-2xl ring-1 ring-slate-200"
        style={{ boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
      >
        <div className="h-1 w-full" style={{ background: accentPlan.color }} />
        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
          <div className="flex gap-3">
            <span className="text-2xl" aria-hidden>
              🔓
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{headline}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{sub}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {effectiveRequired === 'ultimate'
                ? `What you get with ${PLANS.ultimate.name}`
                : `What you get with ${PLANS.advanced.name}`}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {(effectiveRequired === 'ultimate' ? ULTIMATE_BULLETS : ADVANCED_BULLETS).map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {cards.length === 0 ? (
            <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              You are already on the highest plan. If something still looks locked, try refreshing the page.
            </p>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {cards.map((pid) => {
              const p = PLANS[pid];
              if (!p) return null;
              const selected = pid === currentPlanId;
              return (
                <div
                  key={pid}
                  className={`rounded-2xl border-2 p-4 transition ${
                    selected ? 'border-[#2563eb] ring-2 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  {p.badge ? (
                    <span className="mb-2 inline-block rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {p.badge}
                    </span>
                  ) : null}
                  <p className="text-base font-bold text-slate-900">{p.name}</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    ${p.price_monthly}
                    <span className="text-sm font-semibold text-slate-500">/mo</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">${p.price_yearly}/year billed yearly</p>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white transition hover:opacity-95"
                    style={{ background: p.color }}
                    onClick={() => {
                      hideUpgradeModal();
                      navigate('/settings#plan');
                    }}
                  >
                    {p.cta}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 hover:text-slate-800"
              onClick={() => hideUpgradeModal()}
            >
              Maybe later
            </button>
            <Link
              to="/pricing"
              className="text-sm font-bold text-[#2563eb] hover:underline"
              onClick={() => hideUpgradeModal()}
            >
              See full comparison →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
