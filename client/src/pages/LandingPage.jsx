import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { landingPreviewAPI } from '../lib/api.js';
import { LANDING_PALETTE_SWATCHES } from '../data/landingPalettes.js';
import { PLANS, PLAN_ORDER, planHighlights } from '../data/plans.js';
import { LandingSignatureIframe } from '../components/landing/LandingSignatureIframe.jsx';
import { LandingTemplateShowcase } from '../components/landing/LandingTemplateShowcase.jsx';
import { LandingPaletteDemoDark } from '../components/landing/LandingPaletteDemoDark.jsx';
import { ScrollReveal } from '../components/landing/ScrollReveal.jsx';
import { BRAND_NAME } from '../constants/brand.js';

function LogoMark({ className = '', inverted = false }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-sm ${className}`}
      style={{
        backgroundColor: inverted ? 'white' : 'var(--sb-color-accent)',
        color: inverted ? 'var(--sb-color-accent)' : 'white',
      }}
    >
      S
    </span>
  );
}

function IconTwitter() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function IconGithub() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function formatMoney(n) {
  return `$${Number(n).toFixed(0)}`;
}

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#templates', label: 'Templates' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#blog', label: 'Blog' },
];

const HERO_WORDS = ['Your', 'email', 'signature', 'is', 'your', 'best', 'first', 'impression.'];

const TESTIMONIALS = [
  {
    quote: 'The templates are absolutely stunning. I had a professional signature in 4 minutes flat.',
    name: 'Sarah Chen',
    role: 'Marketing Director',
    company: 'Stripe',
  },
  {
    quote: 'We rolled this out to our 50-person team. Every signature looks consistent and on-brand.',
    name: 'Marcus Williams',
    role: 'Head of Operations',
    company: 'Notion',
  },
  {
    quote: 'Finally a signature tool that actually works in Outlook without breaking the design.',
    name: 'Priya Patel',
    role: 'Founder',
    company: 'LaunchPad',
  },
  {
    quote: 'The palette switcher is magic. Changed our brand colors and updated every signature in 10 seconds.',
    name: 'Tom Rodriguez',
    role: 'CTO',
    company: 'Buildspace',
  },
  {
    quote: 'I use this for all my clients as a freelance designer. They always ask how it was made.',
    name: 'Aisha Johnson',
    role: 'Brand Designer',
    company: 'Independent',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does it really work in Outlook?',
    a: 'Yes. Our HTML uses email-safe table layouts with fully inlined CSS, which is the only approach that renders correctly in Outlook 2016, 2019, and 365.',
  },
  {
    q: 'What happens when I change my brand colors?',
    a: 'Pick a new palette in the editor — your live preview and saved signature update instantly. Duplicate signatures on Gold or Silver if you need different brands side by side.',
  },
  {
    q: 'Can I use my own Figma design?',
    a: 'Yes! You can upload your Figma-designed signature as a template. Our system converts it to email-safe HTML automatically.',
  },
  {
    q: 'Which plan should I start on?',
    a: 'Most people start on Bronze (up to 3 signatures and 5 layouts). Upgrade to Gold when you want CTA banners, custom palettes, PNG export, or to hide the “Made with” badge.',
  },
  {
    q: 'How do I add the signature to Gmail?',
    a: 'Copy your signature, open Gmail Settings → General → Signature, create a new signature, and paste. The HTML renders perfectly. We have a 2-minute video guide.',
  },
  {
    q: "What's the refund policy?",
    a: 'We offer a 30-day money-back guarantee on paid subscriptions when we cannot resolve a legitimate issue.',
  },
];

function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function paletteToApi(colors) {
  return { primary: colors[0], secondary: colors[1], accent: colors[2], text: colors[3] };
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [heroHtml, setHeroHtml] = useState('');
  const [pricingYearly, setPricingYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const immersiveRef = useRef(null);
  const [parallaxY, setParallaxY] = useState(0);
  const howRef = useRef(null);
  const [howRevealed, setHowRevealed] = useState(false);

  useLockBodyScroll(mobileOpen);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await landingPreviewAPI.signatureHtmlBatch({
          templateIds: ['template_1'],
          palette: paletteToApi(LANDING_PALETTE_SWATCHES[0].colors),
        });
        if (!cancelled) setHeroHtml(data?.htmlById?.template_1 || '');
      } catch {
        if (!cancelled) setHeroHtml('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = immersiveRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = r.top + r.height / 2;
      const t = (center - vh / 2) / vh;
      setParallaxY(Math.max(-18, Math.min(18, t * -24)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = howRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHowRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const serif = useMemo(() => ({ fontFamily: 'var(--sb-font-serif)' }), []);
  const sans = useMemo(() => ({ fontFamily: 'var(--sb-font-sans)' }), []);

  return (
    <div className="min-h-screen bg-white text-[var(--gray-950)]" style={sans}>
      <header
        className="sticky top-0 z-[100] h-16 border-b bg-white/75 backdrop-blur-[20px]"
        style={{ borderColor: 'var(--border-sm)' }}
      >
        <nav className="relative mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="sb-landing-nav-logo relative z-10 flex min-w-0 items-center gap-2.5">
            <LogoMark />
            <span className="truncate text-base font-semibold tracking-tight sm:text-lg">
              Signature{' '}
              <span style={{ color: 'var(--sb-color-accent)' }}>Studio</span>
            </span>
          </Link>
          <div className="pointer-events-none absolute inset-x-0 hidden items-center justify-center md:flex">
            <div className="pointer-events-auto flex items-center gap-8">
              {NAV_LINKS.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="sb-landing-nav-link text-sm font-medium text-[var(--gray-600)] transition-colors hover:text-[var(--gray-950)]"
                  style={{ animationDelay: `${450 + i * 50}ms` }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="hidden items-center gap-4 md:flex">
              <Link
                to="/login"
                className="sb-landing-nav-link text-sm font-semibold text-[var(--gray-600)] hover:text-[var(--gray-950)]"
                style={{ animationDelay: `${450 + NAV_LINKS.length * 50}ms` }}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="sb-landing-nav-link inline-flex h-[38px] items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--sb-color-accent-hover)]"
                style={{
                  animationDelay: `${500 + NAV_LINKS.length * 50}ms`,
                  backgroundColor: 'var(--sb-color-accent)',
                }}
              >
                Get started free
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--gray-950)] transition-colors hover:bg-[var(--gray-100)] md:hidden"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </nav>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-white/95 px-6 pb-10 pt-24 backdrop-blur-xl md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
        >
          <button
            type="button"
            className="absolute right-4 top-5 inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--gray-100)]"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <IconClose />
          </button>
          <div className="flex flex-col gap-6 text-lg font-medium">
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} className="text-[var(--gray-950)]" onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            <Link to="/login" className="text-[var(--gray-600)]" onClick={() => setMobileOpen(false)}>
              Log in
            </Link>
            <Link
              to="/signup"
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-[var(--sb-color-accent)] font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Get started free
            </Link>
          </div>
        </div>
      ) : null}

      <main>
        {/* HERO */}
        <section
          className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8"
          style={{
            backgroundColor: '#fff',
            backgroundImage: `
              linear-gradient(var(--border-xs) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-xs) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        >
          <div className="relative mx-auto max-w-[960px] text-center">
            <div
              className="mx-auto mb-8 inline-flex animate-[sb-fade-up_0.5s_var(--ease-out)_0.1s_forwards] items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold opacity-0 sm:text-sm"
              style={{
                borderColor: 'var(--sb-color-accent)',
                background: 'rgb(239 246 255 / 0.9)',
                color: 'var(--sb-color-accent-hover)',
              }}
            >
              <span className="sb-badge-sparkle" aria-hidden>
                ✨
              </span>
              New: curated layouts & one-click brand palettes →
            </div>

            <h1
              className="text-[28px] font-normal leading-[1.12] tracking-tight text-[var(--gray-950)] sm:text-[44px] lg:text-[64px]"
              style={serif}
            >
              {HERO_WORDS.map((w, i) => (
                <span
                  key={`${w}-${i}`}
                  className="sb-hero-word"
                  style={{
                    animationDelay: `${i * 10}ms`,
                    fontStyle: w === 'best' ? 'italic' : undefined,
                  }}
                >
                  {w}
                  {i < HERO_WORDS.length - 1 ? '\u00a0' : ''}
                </span>
              ))}
            </h1>

            <p className="sb-hero-sub mx-auto mt-6 max-w-[580px] text-[18px] leading-[1.65] text-[var(--text-tertiary)] opacity-0">
              Build a clean, on-brand signature in the browser. Pick a layout, adjust colors and copy, then paste it
              into Gmail, Outlook, or Apple Mail.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3" style={{ gap: '12px' }}>
              <Link
                to="/signup"
                className="inline-flex h-[52px] w-full min-w-[220px] items-center justify-center rounded-xl px-8 text-base font-semibold text-white shadow-lg transition hover:opacity-95 sm:w-auto"
                style={{ backgroundColor: 'var(--sb-color-accent)' }}
              >
                Get started — it&apos;s free →
              </Link>
              <button
                type="button"
                className="inline-flex h-[52px] w-full min-w-[200px] items-center justify-center rounded-xl border border-[var(--border-sm)] bg-white px-8 text-base font-semibold text-[var(--gray-950)] transition hover:bg-[var(--gray-50)] sm:w-auto"
              >
                ▶ Watch 90 sec demo
              </button>
            </div>
            <p className="mt-6 text-center text-xs text-[var(--gray-400)]">
              ✓ Plans from $7/mo · ✓ Cancel anytime · ✓ Setup in minutes
            </p>

            {/* Hero visual */}
            <div className="relative mx-auto mt-14 max-w-[880px]">
              <div
                className="sb-mockup-scale-in relative overflow-hidden rounded-[24px] border border-[var(--border-sm)] bg-white shadow-2xl"
                style={{ boxShadow: '0 25px 50px -12px rgb(15 23 42 / 0.18)' }}
              >
                <div
                  className="flex h-[38px] items-center gap-2 border-b border-[var(--border-sm)] px-3"
                  style={{ background: 'var(--gray-100)' }}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                  <div className="ml-2 flex-1 truncate rounded-md bg-white px-2 py-1 text-left text-[11px] text-[var(--gray-500)]">
                    app.signaturestudio.io/editor
                  </div>
                </div>
                <div className="flex justify-center bg-[var(--gray-50)] p-3 sm:p-4">
                  <div
                    className="flex w-full max-w-[920px] overflow-hidden rounded-lg border border-[var(--border-sm)] bg-white"
                    style={{ zoom: 0.55 }}
                  >
                    <div
                      className="hidden w-[240px] shrink-0 border-r border-[var(--border-sm)] p-3 sm:block"
                      style={{ background: 'var(--gray-50)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--gray-500)]">My information</p>
                      <div className="mt-2 space-y-2">
                        <div className="h-2 rounded bg-[var(--gray-200)]" />
                        <div className="h-2 rounded bg-[var(--gray-200)]" />
                        <div className="h-2 w-[80%] rounded bg-[var(--gray-200)]" />
                        <div className="h-2 w-[60%] rounded bg-[var(--gray-200)]" />
                      </div>
                      <p className="mt-4 text-[10px] font-bold uppercase text-[var(--gray-500)]">Palettes</p>
                      <div className="mt-2 flex gap-1">
                        {['#2563eb', '#1d4ed8', '#93c5fd', '#0f172a'].map((c) => (
                          <span key={c} className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 p-3">
                      <p className="mb-2 text-[10px] font-semibold text-[var(--gray-500)]">Live preview · Pristine</p>
                      <LandingSignatureIframe html={heroHtml} minHeight={260} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT IMMERSIVE */}
        <section
          ref={immersiveRef}
          className="border-t py-[48px] sm:py-[70px] lg:py-[100px]"
          style={{ borderColor: 'var(--gray-800)', background: 'var(--gray-950)' }}
        >
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-[12px] font-bold uppercase tracking-[2px] text-[var(--sb-color-accent)]">The editor</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-[32px] font-normal leading-tight text-white lg:text-[40px]" style={serif}>
              See your signature come to life as you type
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-[var(--gray-400)]">
              Every keystroke updates the preview in real time.
            </p>

            <div className="relative mx-auto mt-14 max-w-[1000px]">
              <div
                className="relative rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-2 shadow-2xl transition-transform duration-200 ease-out"
                style={{ transform: `translateY(${parallaxY}px)` }}
              >
                <div className="flex h-10 items-center gap-2 rounded-t-lg bg-[var(--gray-800)] px-3">
                  <span className="h-2 w-2 rounded-full bg-red-500/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/90" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
                  <span className="ml-2 text-[11px] text-[var(--gray-500)]">editor — James Doe</span>
                </div>
                <div className="grid gap-0 rounded-b-lg bg-white lg:grid-cols-[260px_1fr_200px]">
                  <div className="border-b border-[var(--border-sm)] p-4 lg:border-b-0 lg:border-r">
                    <p className="text-xs font-bold uppercase text-[var(--gray-500)]">My information</p>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="text-[var(--gray-400)]">Name</span>
                        <div className="mt-1 rounded border border-[var(--border-sm)] bg-[var(--gray-50)] px-2 py-1.5">James Doe</div>
                      </div>
                      <div>
                        <span className="text-[var(--gray-400)]">Title</span>
                        <div className="mt-1 rounded border border-[var(--border-sm)] bg-[var(--gray-50)] px-2 py-1.5">Software Engineer</div>
                      </div>
                      <div>
                        <span className="text-[var(--gray-400)]">Email</span>
                        <div className="mt-1 rounded border border-[var(--border-sm)] bg-[var(--gray-50)] px-2 py-1.5">james.doe@example.com</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <LandingSignatureIframe html={heroHtml} minHeight={280} />
                  </div>
                  <div className="hidden border-l border-[var(--border-sm)] bg-[var(--gray-50)] p-4 lg:block">
                    <p className="text-xs font-bold uppercase text-[var(--gray-500)]">Palettes</p>
                    <div className="mt-3 space-y-2">
                      {LANDING_PALETTE_SWATCHES.slice(0, 6).map((p) => (
                        <div key={p.id} className="flex items-center gap-2 rounded-lg border border-[var(--border-sm)] bg-white px-2 py-1.5 text-[11px] font-medium">
                          <span className="h-6 w-6 shrink-0 rounded-full" style={{ background: p.colors[0] }} />
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sb-float-card-1 absolute -right-2 top-1/4 z-10 hidden max-w-[200px] rounded-xl border border-[var(--gray-700)] bg-[var(--gray-900)] px-3 py-2 text-left text-xs text-white shadow-xl sm:block">
                <p className="font-semibold">⚡ Live preview</p>
                <p className="text-[var(--gray-400)]">Updates instantly</p>
              </div>
              <div className="sb-float-card-2 absolute -left-4 bottom-1/4 z-10 hidden max-w-[200px] rounded-xl border border-[var(--gray-700)] bg-[var(--gray-900)] px-3 py-2 text-left text-xs text-white shadow-xl sm:block">
                <p className="font-semibold">🎨 10 palettes</p>
                <p className="text-[var(--gray-400)]">Swap in 1 click</p>
              </div>
              <div className="sb-float-card-3 absolute right-8 bottom-2 z-10 hidden max-w-[200px] rounded-xl border border-[var(--gray-700)] bg-[var(--gray-900)] px-3 py-2 text-left text-xs text-white shadow-xl sm:block">
                <p className="font-semibold">✓ Gmail ready</p>
                <p className="text-[var(--gray-400)]">Copy &amp; paste</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="scroll-mt-24 border-t py-[48px] sm:py-[70px] lg:py-[100px]" style={{ borderColor: 'var(--border-sm)' }}>
          <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sb-color-accent)]">Features</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-center text-[32px] font-normal leading-tight lg:text-[38px]" style={serif}>
              Everything you need for the perfect signature
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-[var(--text-tertiary)]">
              Built for individuals and teams who want to make every email count.
            </p>
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
              {[
                {
                  title: 'Curated professional layouts',
                  body: 'Designer-quality templates you can swap anytime after saving',
                  badge: null,
                  icon: (
                    <div className="grid grid-cols-2 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[4/3] rounded bg-gradient-to-br from-blue-100 to-indigo-200" />
                      ))}
                    </div>
                  ),
                },
                {
                  title: 'Live Color Palettes',
                  body: 'Switch between 10 brand palettes instantly. Every element updates.',
                  badge: null,
                  icon: (
                    <div className="flex flex-wrap gap-1.5">
                      {['#2563eb', '#7c3aed', '#059669', '#ea580c', '#e11d48', '#0d9488', '#64748b', '#f59e0b', '#ec4899', '#6366f1'].map(
                        (c) => (
                          <span key={c} className="h-6 w-6 rounded-full border border-white shadow-sm" style={{ background: c }} />
                        )
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Works Everywhere',
                  body: 'Install to Gmail, Outlook, Yahoo, Apple Mail, and Spark',
                  badge: null,
                  icon: (
                    <div className="flex gap-2 text-[11px] font-bold text-[var(--gray-600)]">
                      <span className="rounded bg-[var(--gray-100)] px-2 py-1">Gmail</span>
                      <span className="rounded bg-[var(--gray-100)] px-2 py-1">Outlook</span>
                      <span className="rounded bg-[var(--gray-100)] px-2 py-1">Apple</span>
                    </div>
                  ),
                },
                {
                  title: 'One-Click Copy',
                  body: 'Copy as HTML or as a generated image where your browser allows it — then paste into your mail client.',
                  badge: null,
                  icon: <span className="text-3xl">📋</span>,
                },
                {
                  title: 'Optional CTA banners',
                  body: 'Add one or two call-to-action strips under your signature, matched to your layout width.',
                  badge: null,
                  icon: (
                    <div className="flex gap-1 rounded-lg border border-[var(--border-sm)] bg-[var(--gray-50)] px-2 py-2">
                      <span className="h-8 flex-1 rounded bg-[var(--sb-color-accent)]/25" />
                      <span className="h-8 flex-1 rounded bg-[var(--sb-color-accent)]/40" />
                    </div>
                  ),
                },
                {
                  title: 'Your data, your fields',
                  body: 'Only the contact lines you fill in appear in the signature — no fake phone numbers or placeholders in exports.',
                  badge: null,
                  icon: (
                    <div className="flex flex-col gap-1 text-left text-[10px] font-medium text-[var(--gray-600)]">
                      <span className="rounded border border-[var(--border-sm)] bg-white px-2 py-1">Email</span>
                      <span className="rounded border border-dashed border-[var(--gray-300)] bg-white/60 px-2 py-1 text-[var(--gray-400)]">
                        Phone (optional)
                      </span>
                    </div>
                  ),
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group rounded-2xl border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--sb-color-accent)] hover:shadow-lg"
                  style={{ borderColor: 'var(--border-sm)' }}
                >
                  <div className="flex h-14 items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">{card.icon}</div>
                    {card.badge ? (
                      <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                        {card.badge}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[var(--gray-950)]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-tertiary)]">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LandingTemplateShowcase />

        {/* HOW IT WORKS */}
        <section
          ref={howRef}
          className="border-t py-[48px] sm:py-[70px] lg:py-[100px]"
          style={{ borderColor: 'var(--border-sm)' }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sb-color-accent)]">How it works</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-center text-[32px] font-normal lg:text-[38px]" style={serif}>
              From design to inbox in under 3 minutes
            </h2>

            <div className="relative mt-16 grid gap-12 lg:grid-cols-3">
              <div
                className="pointer-events-none absolute left-0 right-0 top-8 hidden h-0.5 border-t border-dashed border-[var(--gray-200)] lg:block"
                style={{ marginLeft: '12%', marginRight: '12%' }}
              />
              {[
                {
                  n: '01',
                  title: 'Choose a template',
                  desc: 'Browse curated layouts or start from one that matches your role and industry.',
                  mock: 'gallery',
                },
                {
                  n: '02',
                  title: 'Customize in the editor',
                  desc: 'Update fields, palettes, and optional banners — preview updates live as you type.',
                  mock: 'editor',
                },
                {
                  n: '03',
                  title: 'Paste into Gmail or Outlook',
                  desc: 'Copy email-safe HTML and drop it into your client settings in under a minute.',
                  mock: 'gmail',
                },
              ].map((step, idx) => (
                <div key={step.n} className="relative text-center lg:text-left">
                  <div className="flex flex-col items-center gap-4 lg:items-start">
                    <span className="text-[60px] font-normal leading-none text-[var(--sb-color-accent)]" style={serif}>
                      {step.n}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[var(--sb-color-accent)]">
                      {idx === 0 ? '◇' : idx === 1 ? '✎' : '✉'}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--gray-950)]">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--text-tertiary)]">{step.desc}</p>
                  </div>
                  <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border-sm)] bg-[var(--gray-50)] p-3 shadow-sm">
                    {step.mock === 'gallery' ? (
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="aspect-[4/5] rounded-lg bg-gradient-to-br from-slate-200 to-slate-100" />
                        ))}
                      </div>
                    ) : null}
                    {step.mock === 'editor' ? (
                      <div className="space-y-2">
                        <div className="h-2 rounded bg-slate-200" />
                        <div className="h-2 w-[83%] rounded bg-slate-200" />
                        <div className="mt-3 rounded border border-white bg-white p-2 text-[10px] text-slate-500">Live preview</div>
                      </div>
                    ) : null}
                    {step.mock === 'gmail' ? (
                      <div className="rounded border border-slate-200 bg-white p-2 text-left text-[10px] text-slate-600">
                        <p className="font-semibold">Settings → Signature</p>
                        <div className="mt-2 h-8 rounded bg-slate-100" />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-2xl overflow-hidden lg:mt-14">
              <svg viewBox="0 0 400 24" className="w-full text-[var(--sb-color-accent)]" aria-hidden>
                <path
                  d="M4 12 H396"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="400"
                  strokeDashoffset={howRevealed ? 0 : 400}
                  style={{ transition: 'stroke-dashoffset 1.2s var(--ease-out)' }}
                />
                <polygon
                  points="396,12 388,8 388,16"
                  fill="currentColor"
                  opacity={howRevealed ? 1 : 0}
                  style={{ transition: 'opacity 0.4s ease 1s' }}
                />
              </svg>
            </div>
          </div>
        </section>

        <LandingPaletteDemoDark />

        {/* TESTIMONIALS */}
        <section
          className="border-t py-[48px] sm:py-[70px] lg:py-[100px]"
          style={{ borderColor: 'var(--border-sm)', background: 'var(--gray-50)' }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sb-color-accent)]">Testimonials</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-center text-[32px] font-normal lg:text-[38px]" style={serif}>
              Trusted by professionals worldwide
            </h2>
            <p className="mt-4 text-center text-sm font-medium text-[var(--gray-600)]">
              Real stories from people who care about how their email looks.
            </p>
            <div className="sb-testimonial-row relative mt-12 overflow-hidden">
              <div className="sb-testimonial-track gap-6 pr-6">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <blockquote
                    key={`${t.name}-${i}`}
                    className="w-[300px] shrink-0 rounded-xl border border-[var(--border-sm)] bg-white p-5 shadow-sm"
                    style={{ minHeight: 180 }}
                  >
                    <p className="text-[14px] italic leading-relaxed text-[var(--gray-700)]">&ldquo;{t.quote}&rdquo;</p>
                    <hr className="my-4 border-[var(--border-sm)]" />
                    <div className="flex gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--gray-950)]">{t.name}</p>
                        <p className="text-xs text-[var(--gray-500)]">
                          {t.role} · {t.company}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-amber-500">★★★★★</p>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="scroll-mt-24 border-t py-[48px] sm:py-[70px] lg:py-[100px]" style={{ borderColor: 'var(--border-sm)' }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sb-color-accent)]">Pricing</p>
            <h2 className="mx-auto mt-3 text-center text-[32px] font-normal lg:text-[38px]" style={serif}>
              {`${PLANS.personal.name}, ${PLANS.advanced.name}, and ${PLANS.ultimate.name}`}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-[var(--gray-600)]">
              Every plan includes curated email-safe layouts, live preview, and install guides for Gmail, Outlook, and more.
              Switch plans whenever your needs change.
            </p>

            <div className="mx-auto mt-8 flex justify-center">
              <div className="inline-flex rounded-full border border-[var(--border-sm)] bg-[var(--gray-50)] p-1 text-sm font-semibold">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 transition ${!pricingYearly ? 'bg-white shadow-sm' : 'text-[var(--gray-600)]'}`}
                  onClick={() => setPricingYearly(false)}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 transition ${pricingYearly ? 'bg-white shadow-sm' : 'text-[var(--gray-600)]'}`}
                  onClick={() => setPricingYearly(true)}
                >
                  Yearly — save ~20%
                </button>
              </div>
            </div>

            <p className="mx-auto mt-5 max-w-lg text-center text-sm text-[var(--gray-600)]">
              <Link to="/pricing" className="font-semibold text-[var(--sb-color-accent)] underline-offset-2 hover:underline">
                View the full feature comparison →
              </Link>
            </p>

            <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
              {PLAN_ORDER.map((pid) => {
                const p = PLANS[pid];
                const popular = pid === 'advanced';
                const displayMonth = pricingYearly ? p.price_yearly_per_month : p.price_monthly;
                const crossed = pricingYearly ? p.price_monthly : null;
                const highlights = planHighlights(pid);

                return (
                  <div
                    key={pid}
                    className={`relative flex flex-col rounded-2xl border bg-white p-8 ${
                      popular ? 'border-2 shadow-xl lg:z-[1] lg:scale-[1.02]' : ''
                    }`}
                    style={
                      popular
                        ? {
                            borderColor: 'var(--sb-color-accent)',
                            boxShadow: '0 0 0 1px rgb(37 99 235 / 0.08), 0 20px 50px -12px rgb(37 99 235 / 0.2)',
                          }
                        : { borderColor: 'var(--border-sm)' }
                    }
                  >
                    {p.badge ? (
                      <span
                        className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white ${
                          popular ? 'bg-[var(--sb-color-accent)]' : 'bg-[var(--gray-800)]'
                        }`}
                      >
                        {p.badge}
                      </span>
                    ) : null}

                    <h3 className="pr-16 text-2xl font-bold text-[var(--gray-950)]">{p.name}</h3>
                    <p className="mt-2 text-sm leading-snug text-[var(--gray-600)]">{p.tagline}</p>

                    <div className="mt-6 border-t border-[var(--border-sm)] pt-6">
                      {pricingYearly && crossed ? (
                        <p className="text-sm text-[var(--gray-400)]">
                          <span className="line-through decoration-[var(--gray-300)]">{formatMoney(crossed)}/mo</span>
                          <span className="ml-2 font-medium text-[var(--gray-500)]">list price</span>
                        </p>
                      ) : null}
                      <div className="mt-1 flex flex-wrap items-baseline gap-1">
                        <span className="text-4xl font-semibold tracking-tight text-[var(--gray-950)]">{formatMoney(displayMonth)}</span>
                        <span className="text-lg font-medium text-[var(--gray-500)]">/mo</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--gray-600)]">
                        {pricingYearly ? (
                          <>
                            Billed <span className="font-semibold text-[var(--gray-800)]">{formatMoney(p.price_yearly)}</span>/year
                          </>
                        ) : (
                          'Billed monthly · cancel anytime'
                        )}
                      </p>
                    </div>

                    <Link
                      to="/signup"
                      className="mt-8 block w-full rounded-xl py-3.5 text-center text-base font-semibold text-white shadow-md transition hover:brightness-105"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.cta}
                    </Link>

                    <div className="mt-8 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--gray-400)]">What&apos;s included</p>
                      <ul className="mt-4 space-y-2.5 text-sm text-[var(--gray-700)]">
                        {highlights.map((line) => (
                          <li key={line} className="flex gap-2">
                            <span className="shrink-0 text-emerald-600" aria-hidden>
                              ✓
                            </span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-8 text-center text-xs text-[var(--gray-500)]">30-day money-back on paid plans when we cannot resolve a legitimate issue.</p>

            <p className="mt-6 text-center text-xs text-[var(--gray-500)]">
              💳 Secure payment by Stripe · Cancel anytime · Prices in USD
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-semibold text-[var(--gray-400)]">
              {['Visa', 'Mastercard', 'AMEX', 'PayPal', 'Apple Pay'].map((x) => (
                <span key={x} className="rounded border border-[var(--border-sm)] bg-[var(--gray-50)] px-3 py-1">
                  {x}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 border-t py-20" style={{ borderColor: 'var(--border-sm)', background: 'var(--gray-50)' }}>
          <div className="mx-auto max-w-[720px] px-4 sm:px-6">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sb-color-accent)]">FAQ</p>
            <h2 className="mt-3 text-center text-[32px] font-normal" style={serif}>
              Common questions
            </h2>
            <div className="mt-10">
              {FAQ_ITEMS.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q} className="border-b border-[var(--border-sm)] py-5">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 text-left text-base font-semibold text-[var(--gray-950)]"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : i)}
                    >
                      {item.q}
                      <span
                        className="text-[var(--gray-500)] transition-transform duration-300"
                        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        ▼
                      </span>
                    </button>
                    <div
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-1 pt-3 text-sm leading-[1.65] text-[var(--gray-600)]">{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BLOG anchor */}
        <section id="blog" className="border-t py-16" style={{ borderColor: 'var(--border-sm)', background: 'var(--gray-50)' }}>
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-normal" style={serif}>
              From the blog
            </h2>
            <p className="mt-3 text-[var(--text-tertiary)]">Playbooks on deliverability, branding, and rollout — publishing soon.</p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden py-[72px] sm:py-[100px] lg:py-[120px]" style={{ background: 'var(--gray-950)' }}>
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="sb-cta-deco absolute rounded-2xl border border-white/20 bg-white/5"
                style={{
                  width: 180,
                  height: 90,
                  left: `${10 + i * 22}%`,
                  top: `${15 + (i % 3) * 25}%`,
                  animationDelay: `${i * 5}s`,
                }}
              />
            ))}
          </div>
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-[var(--gray-300)]">
              🎉 Join 10,000+ professionals
            </span>
            <h2 className="mx-auto mt-6 max-w-xl text-[40px] font-normal leading-[1.1] text-white sm:text-[48px] lg:text-[52px]" style={serif}>
              Ready to make every email count?
            </h2>
            <p className="mx-auto mt-6 max-w-[480px] text-lg text-[var(--gray-400)]">
              Your email signature is one of the most-seen pieces of your personal brand. Make it memorable.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex h-14 min-w-[240px] items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-[var(--gray-950)] transition hover:bg-[var(--gray-100)]"
              >
                Get started free — takes 2 minutes →
              </Link>
              <a
                href="#templates"
                className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-xl border border-white/30 px-8 text-base font-semibold text-white transition hover:bg-white/10"
              >
                View all templates
              </a>
            </div>
            <p className="mt-8 text-[13px] text-[var(--gray-500)]">
              ✓ Free forever &nbsp; ✓ No credit card &nbsp; ✓ 2-minute setup
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t py-16 pb-8" style={{ borderColor: 'var(--gray-800)', background: 'var(--gray-950)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <LogoMark inverted className="!h-8 !w-8 !text-xs" />
                <span className="text-lg font-semibold text-white">
                  Signature <span className="text-blue-400">Studio</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-[var(--gray-500)]">
                Professional email signatures for individuals and teams.
              </p>
              <div className="mt-4 flex gap-4 text-[var(--gray-500)]">
                <a href="#" className="transition hover:text-[var(--gray-300)]" aria-label="LinkedIn">
                  <IconLinkedIn />
                </a>
                <a href="#" className="transition hover:text-[var(--gray-300)]" aria-label="Twitter">
                  <IconTwitter />
                </a>
                <a href="#" className="transition hover:text-[var(--gray-300)]" aria-label="GitHub">
                  <IconGithub />
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--gray-500)]">Product</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--gray-500)]">
                {['Templates', 'Pricing', 'Changelog', 'Blog'].map((x) => (
                  <li key={x}>
                    <a href={x === 'Templates' ? '#templates' : x === 'Pricing' ? '#pricing' : '#'} className="transition hover:text-[var(--gray-300)]">
                      {x}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--gray-500)]">Compare</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--gray-500)]">
                {['vs WiseStamp', 'vs MySignature', 'vs Exclaimer', 'vs HubSpot Generator'].map((x) => (
                  <li key={x}>
                    <a href="#" className="transition hover:text-[var(--gray-300)]">
                      {x}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--gray-500)]">Legal</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--gray-500)]">
                {['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Contact us'].map((x) => (
                  <li key={x}>
                    <a href={x === 'Contact us' ? 'mailto:hello@signaturestudio.io' : '#'} className="transition hover:text-[var(--gray-300)]">
                      {x}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[var(--gray-800)] pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-xs text-[var(--gray-500)] sm:flex-row">
              <p>
                © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
              </p>
              <p>Made with ♥ for email professionals worldwide</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
