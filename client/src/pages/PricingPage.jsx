import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLANS, PLAN_ORDER, COMPARISON_TABLE, planHighlights } from '../data/plans.js';

function formatMoney(n) {
  return `$${Number(n).toFixed(0)}`;
}

function CheckIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-7.5 9.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 6.848-8.679a.75.75 0 011.052-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const FAQ = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes. Upgrade or downgrade when your needs change. Billing can be managed from Settings once checkout is connected.',
  },
  {
    q: 'What counts as an active signature?',
    a: 'Each saved card on your dashboard. Duplicating adds another until you delete one.',
  },
  {
    q: 'Do all plans include install guides?',
    a: 'Yes — Gmail, Outlook, Yahoo, Apple Mail, and Spark.',
  },
  {
    q: 'Does Personal include copy to clipboard and PNG export?',
    a: 'Yes. Personal includes server-rendered signature PNGs for Copy to clipboard and Copy HTML code. Advanced and Ultimate add more layouts, premium CTA banners, higher limits, and hosted image URL options where configured.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Start on Personal and explore the editor. Upgrade in one click whenever you hit a limit.',
  },
];

export function PricingPage() {
  const [yearly, setYearly] = useState(true);

  const serif = useMemo(() => ({ fontFamily: 'var(--sb-font-serif, "DM Serif Display", Georgia, serif)' }), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90 pb-24 pt-12 text-slate-900 sm:pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563eb]">Pricing</p>
          <h1
            className="mt-3 text-[2rem] font-normal leading-[1.15] tracking-tight text-slate-900 sm:text-[2.5rem]"
            style={serif}
          >
            Simple pricing for every team size
          </h1>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-slate-600">
            Every plan includes curated email layouts, unlimited installs, and full client install guides. Pick monthly or
            yearly billing — change anytime.
          </p>
        </header>

        {/* Billing toggle */}
        <div className="mx-auto mt-10 flex justify-center">
          <div
            className="inline-flex rounded-full border border-slate-200/90 bg-slate-100/90 p-1 shadow-inner"
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                !yearly ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setYearly(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                yearly ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setYearly(true)}
            >
              Yearly <span className="text-emerald-600">~20% off</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {PLAN_ORDER.map((pid) => {
            const p = PLANS[pid];
            const popular = pid === 'advanced';
            const displayMonth = yearly ? p.price_yearly_per_month : p.price_monthly;
            const crossed = yearly ? p.price_monthly : null;
            const highlights = planHighlights(pid);

            return (
              <article
                key={pid}
                className={`relative flex flex-col overflow-hidden rounded-3xl border bg-white/95 shadow-lg shadow-slate-900/[0.04] backdrop-blur-sm transition hover:shadow-xl hover:shadow-slate-900/[0.06] ${
                  popular
                    ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20 lg:scale-[1.02] lg:z-[1]'
                    : 'border-slate-200/80'
                }`}
              >
                {p.badge ? (
                  <div
                    className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${
                      popular ? 'bg-[#2563eb]' : 'bg-slate-800'
                    }`}
                  >
                    {p.badge}
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">{p.name}</h2>
                  <p className="mt-2 text-[15px] leading-snug text-slate-500">{p.tagline}</p>

                  <div className="mt-8 border-t border-slate-100 pt-8">
                    {yearly && crossed ? (
                      <p className="text-sm text-slate-400">
                        <span className="line-through decoration-slate-300">{formatMoney(crossed)}/mo</span>
                        <span className="ml-2 font-medium text-slate-500">list price</span>
                      </p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">{formatMoney(displayMonth)}</span>
                      <span className="text-lg font-semibold text-slate-400">/mo</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {yearly ? (
                        <>
                          Billed <span className="font-semibold text-slate-700">{formatMoney(p.price_yearly)}</span>/year
                        </>
                      ) : (
                        'Billed monthly · cancel anytime'
                      )}
                    </p>
                  </div>

                  <Link
                    to="/signup"
                    className="mt-8 block w-full rounded-2xl py-3.5 text-center text-[15px] font-bold text-white shadow-md transition hover:brightness-105 active:scale-[0.99]"
                    style={{ background: p.color }}
                  >
                    {p.cta}
                  </Link>

                  <div className="mt-8 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">What&apos;s included</p>
                    <ul className="mt-4 space-y-3.5">
                      {highlights.map((line) => (
                        <li key={line} className="flex gap-3 text-[14px] leading-snug text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckIcon className="h-3 w-3" />
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Comparison */}
        <section className="mt-20 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/[0.06]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 sm:px-8">
            <h2 className="text-lg font-bold tracking-tight text-white">Compare everything in one place</h2>
            <p className="mt-1 text-sm text-slate-300">Same data as the app — pick the column that fits you.</p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/95">
                    <th className="sticky left-0 z-20 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 sm:px-8">
                      Feature
                    </th>
                    <th className="border-b border-slate-200 px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                      Personal
                    </th>
                    <th className="border-b border-slate-200 bg-blue-50/50 px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#1d4ed8]">
                      Advanced
                    </th>
                    <th className="border-b border-slate-200 px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                      Ultimate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_TABLE.map((section) => (
                    <Fragment key={section.category}>
                      <tr>
                        <td
                          colSpan={4}
                          className="sticky left-0 border-b border-slate-100 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 sm:px-8"
                          style={{ backgroundColor: `${section.color}99` }}
                        >
                          {section.category}
                        </td>
                      </tr>
                      {section.rows.map((row, ri) => (
                        <tr
                          key={row.feature}
                          className={`border-b border-slate-100 transition-colors hover:bg-slate-50/80 ${
                            ri % 2 === 1 ? 'bg-slate-50/40' : ''
                          }`}
                        >
                          <td className="sticky left-0 z-10 border-r border-transparent bg-white px-5 py-3 font-medium text-slate-800 sm:px-8">
                            {row.feature}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600">{row.personal}</td>
                          <td className="bg-blue-50/30 px-4 py-3 text-center font-medium text-slate-800">{row.advanced}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{row.ultimate}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">Questions</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-sm open:border-slate-300 open:shadow-md"
              >
                <summary className="cursor-pointer list-none text-[15px] font-bold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-slate-400 transition group-open:rotate-180">▼</span>
                  </span>
                </summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto mt-20 max-w-xl rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 p-8 text-center shadow-lg shadow-slate-900/[0.04] sm:p-10">
          <h2 className="text-xl font-bold text-slate-900">Not sure yet?</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Start on Personal and move up when you need more layouts, banners, or exports. Limits are always visible in
            the app.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[#2563eb] px-8 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#1d4ed8]"
            >
              Create account
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
