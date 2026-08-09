import { useState } from 'react'
import {
  ArrowRight,
  Check,
  Languages,
  Menu,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'
import { ILLUSTRATIONS } from '../components/illustrations'
import type { Theme } from '../hooks/useTheme'
import { gsap, prefersReducedMotion, useGSAP } from '../lib/animations'
import { useReveal } from '../hooks/useReveal'
import { complaints } from '../data'

/* ────────────────────────────────────────────────────────────
   SevaNest landing page (public, signed-out).
   Front-door job: make a visitor *try the matcher*. The hero's
   right half is a live demo of the product's core — type about
   your life, see schemes match — played once on load, gated by
   prefers-reduced-motion. design.md tokens throughout.
   ──────────────────────────────────────────────────────────── */

interface LandingPageProps {
  theme: Theme
  onToggleTheme: () => void
  onGetStarted: () => void
  onGuestDemo: () => void
  onAnonComplaint: () => void
  onTrackComplaint: () => void
}

const NAV_LINKS = [
  { id: 'how-it-works', label: 'How it works' },
  { id: 'catalog', label: 'Schemes' },
  { id: 'complaints', label: 'Complaints' },
]

/* ── Live matcher demo content (mirrors the real SchemesSection copy) ── */

const DEMO_PROMPT =
  "I'm a 32-year-old woman farmer in Nadia. We own 1.5 acres and earn under ₹2 lakh a year."

const DEMO_MATCHES = [
  {
    title: 'PM-Kisan',
    benefit: '₹6,000 / year',
    color: 'bg-card-terracotta',
    illustration: 'sun',
  },
  {
    title: 'Ration Card (NFSA)',
    benefit: '30 kg grain / month',
    color: 'bg-card-olive',
    illustration: 'leaf',
  },
  {
    title: 'PM Awas Yojana',
    benefit: '₹2.5L housing grant',
    color: 'bg-card-lavender',
    illustration: 'spiral',
  },
]

const TICKER_NAMES = [
  'PM-KISAN',
  'Kanyashree Prakalpa',
  'MGNREGA',
  'PM Awas Yojana',
  'Ration Card (NFSA)',
  'Lakshmir Bhandar',
  'Ayushman Bharat',
  'Sukanya Samriddhi',
  'PM Ujjwala',
  'Old Age Pension',
]

const CATEGORY_CARDS = [
  {
    category: 'Housing',
    example: 'PM Awas Yojana',
    benefit: '₹2.5L grant',
    color: 'bg-card-lavender',
    illustration: 'spiral',
  },
  {
    category: 'Food',
    example: 'Ration Card (NFSA)',
    benefit: '30 kg grain / month',
    color: 'bg-card-olive',
    illustration: 'leaf',
  },
  {
    category: 'Health',
    example: 'Ayushman Bharat',
    benefit: '₹5L cashless cover',
    color: 'bg-card-sage',
    illustration: 'health',
  },
  {
    category: 'Farmer',
    example: 'PM-Kisan Samman Nidhi',
    benefit: '₹6,000 / year',
    color: 'bg-card-terracotta',
    illustration: 'sun',
  },
  {
    category: 'Education',
    example: 'Kanyashree Prakalpa',
    benefit: '₹25,000 scholarship',
    color: 'bg-card-mauve',
    illustration: 'flower',
  },
  {
    category: 'Women',
    example: 'PM Ujjwala Yojana',
    benefit: 'Free LPG connection',
    color: 'bg-brand-orange',
    illustration: 'health',
  },
  {
    category: 'Savings',
    example: 'Sukanya Samriddhi',
    benefit: '8.2% p.a. interest',
    color: 'bg-card-khaki',
    illustration: 'coins',
  },
  {
    category: 'Pension',
    example: 'Old Age Pension',
    benefit: '₹1,000 / month',
    color: 'bg-brand-mint',
    illustration: 'spiral',
  },
]

const HOW_STEPS = [
  {
    title: 'Tell us about your life',
    text: 'Two minutes, in your language. Who is in your family, what you do, what you earn — plain words are fine.',
    meta: '≈ 2 min · any language',
  },
  {
    title: 'We check 866+ schemes',
    text: 'The engine reads eligibility rules from the original scheme documents and keeps only the ones your family qualifies for.',
    meta: 'AI + rule engine',
  },
  {
    title: 'Apply, then track it',
    text: 'Open the application with step-by-step guidance, keep your documents verified, and get SMS updates until the benefit lands.',
    meta: 'SMS at every step',
  },
]

const HERO_STATS = [
  { value: '866+', label: 'schemes scanned' },
  { value: '2', label: 'minutes to first match' },
  { value: '7', label: 'day escalation window' },
  { value: '₹0', label: 'always free' },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  })
}

/* ── Shared section header grammar ─────────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string
  title: string
  sub?: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold leading-[1.08] tracking-tight text-ink-900 md:text-4xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{sub}</p>
      )}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function LandingPage({
  theme,
  onToggleTheme,
  onGetStarted,
  onGuestDemo,
  onAnonComplaint,
  onTrackComplaint,
}: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (id: string) => {
    setMenuOpen(false)
    scrollToSection(id)
  }

  return (
    <div className="relative z-10">
      {/* ── Sticky nav ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border-subtle/70 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] w-full max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
            className="focus-visible:outline-2 focus-visible:outline-brand-orange rounded-lg"
            aria-label="SevaNest — back to top"
          >
            <Logo />
          </button>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className="relative text-sm font-semibold text-ink-700 transition-colors duration-150 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-orange after:transition-transform after:duration-200 hover:text-ink-900 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-brand-orange"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                window.history.pushState(null, '', '/admin/login')
                window.dispatchEvent(new Event('popstate'))
              }}
              className="hidden items-center gap-2 rounded-full border border-border-subtle bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink-700 shadow-soft transition-all duration-150 hover:border-brand-orange hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange sm:flex"
            >
              <ShieldCheck className="h-4 w-4 text-brand-orange" />
              Officer desk
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button
              onClick={onGetStarted}
              className="hidden rounded-full bg-brand-navy px-5 py-2.5 text-[13px] font-semibold text-navy-contrast shadow-soft transition-colors duration-150 hover:bg-[#2d2839] focus-visible:outline-2 focus-visible:outline-brand-orange dark:hover:bg-[#d9d5cd] md:block"
            >
              Sign in
            </button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-surface text-ink-700 shadow-soft focus-visible:outline-2 focus-visible:outline-brand-orange lg:hidden"
            >
              {menuOpen ? (
                <X className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="border-t border-border-subtle/70 bg-surface/95 px-4 py-4 backdrop-blur-md lg:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => go(link.id)}
                  className="rounded-xl px-3 py-3 text-left text-[15px] font-semibold text-ink-700 transition-colors duration-150 hover:bg-canvas hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onGetStarted()
                }}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-navy-contrast focus-visible:outline-2 focus-visible:outline-brand-orange"
              >
                Sign in
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </nav>
          </div>
        )}
      </header>

      <main>
        <HeroSection
          onGetStarted={onGetStarted}
          onGuestDemo={onGuestDemo}
          onTrackComplaint={onTrackComplaint}
        />
        <Ticker />
        <HowItWorks />
        <CatalogPreview />
        <GrievanceSection
          onAnonComplaint={onAnonComplaint}
          onTrackComplaint={onTrackComplaint}
        />
        <CtaBand onGetStarted={onGetStarted} onAnonComplaint={onAnonComplaint} />
      </main>

      <LandingFooter onGuestDemo={onGuestDemo} />
    </div>
  )
}

/* ── Hero + live matcher demo ──────────────────────────────── */

function HeroSection({
  onGetStarted,
  onGuestDemo,
  onTrackComplaint,
}: {
  onGetStarted: () => void
  onGuestDemo: () => void
  onTrackComplaint: () => void
}) {
  const scope = useReveal<HTMLElement>()

  /* Count-up helper: [data-hero="stat-num"] with data-value="12 units". */
  const countUpStats = (tl: gsap.core.Timeline) => {
    if (!scope.current) return
    const counters = gsap.utils.toArray<HTMLElement>(
      '[data-hero="stat-num"]',
      scope.current,
    )
    counters.forEach((el) => {
      const raw = el.dataset.value ?? '0'
      const match = raw.match(/^([\d.]+)\s*(.*)$/)
      if (!match) return
      const target = parseFloat(match[1])
      const suffix = match[2].trim()
      const decimals = match[1].includes('.') ? 1 : 0
      const proxy = { v: 0 }
      tl.to(
        proxy,
        {
          v: target,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${proxy.v.toFixed(decimals)}${
              suffix ? ` ${suffix}` : ''
            }`
          },
        },
        '<',
      )
    })
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {})
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
        tl.from('[data-hero="eyebrow"]', { y: 14, opacity: 0, duration: 0.5, clearProps: 'all' })
          .from(
            '[data-hero="line"]',
            { yPercent: 115, duration: 0.7, stagger: 0.12, clearProps: 'all' },
            '-=0.3',
          )
          .from(
            '[data-hero="sub"]',
            { y: 14, opacity: 0, duration: 0.5, clearProps: 'all' },
            '-=0.4',
          )
          .from(
            '[data-hero="cta"]',
            { y: 12, opacity: 0, duration: 0.4, stagger: 0.08, clearProps: 'all' },
            '-=0.35',
          )
          .from(
            '[data-hero="stat"]',
            { y: 12, opacity: 0, duration: 0.4, stagger: 0.06, clearProps: 'all' },
            '-=0.3',
          )
          .from(
            '[data-hero="matcher"]',
            { scale: 0.96, opacity: 0, duration: 0.6, ease: 'power2.out', clearProps: 'all' },
            '-=0.45',
          )
        countUpStats(tl)
      })
    },
    { scope },
  )

  return (
    <section
      ref={scope}
      className="mx-auto w-full max-w-[1200px] px-4 pt-6 md:px-6 md:pt-10"
    >
      <div className="hero-band relative overflow-hidden rounded-[28px] px-6 py-10 shadow-soft md:px-10 lg:px-12 lg:py-14 max-md:rounded-[20px] max-md:px-5 max-md:py-8">
        {/* Decorative flourish bleeding off the hero edge (design.md §8) */}
        <svg
          viewBox="0 0 160 80"
          className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-44 text-brand-mint opacity-20 dark:opacity-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M5 40 C 30 15, 55 65, 80 40 S 130 15, 155 40" />
        </svg>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] max-md:gap-8">
          {/* ── Copy column ───────────────────────────────── */}
          <div>
            <span
              data-hero="eyebrow"
              className="inline-flex items-center gap-2 rounded-full bg-surface/70 px-3.5 py-1.5 text-xs font-semibold text-ink-700 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              নমস্কার · West Bengal District Services
            </span>

            <h1 className="mt-5 font-display text-[clamp(2.1rem,5.2vw,3.9rem)] font-bold leading-[1.04] tracking-tight text-ink-900">
              <span className="block overflow-hidden">
                <span data-hero="line" className="block">
                  Every scheme you&rsquo;re{' '}
                  <span className="relative whitespace-nowrap">
                    entitled to,
                    <svg
                      viewBox="0 0 120 10"
                      className="absolute -bottom-1.5 left-0 h-2.5 w-full text-brand-orange"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <path d="M2 7 C 14 2, 26 8, 38 4 S 62 8, 74 4 S 98 8, 118 5" />
                    </svg>
                  </span>
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-hero="line" className="block">
                  found for your family.
                </span>
              </span>
            </h1>

            <p
              data-hero="sub"
              className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-700 md:text-base"
            >
              Tell us about your family in plain words — বাংলা, हिन्दी or
              English. SevaNest reads 866+ government schemes and shows the
              ones that fit. Free, on any phone, with SMS updates in your
              language.
            </p>

            <div className="mt-7 flex flex-wrap items-start justify-start gap-4">
              <button
                data-hero="cta"
                onClick={onGetStarted}
                className="inline-flex w-fit items-center gap-2 rounded-2xl bg-brand-navy px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-navy-contrast shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#2d2839] hover:shadow-lift focus-visible:outline-2 focus-visible:outline-brand-orange dark:hover:bg-[#d9d5cd]"
              >
                Check out all the schemes
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                data-hero="cta"
                onClick={() => scrollToSection('how-it-works')}
                className="inline-flex w-fit items-center justify-center rounded-2xl border border-ink-900/15 bg-surface/60 px-6 py-3.5 text-[13px] font-semibold text-ink-900 backdrop-blur-sm transition-colors duration-150 hover:border-brand-orange hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
              >
                See how it works
              </button>
            </div>

            {/* Reassurance strip — the trust this audience needs */}
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
              {[
                '100% free — never pay anyone',
                'SMS updates in your language',
                'Works on low network & shared phones',
              ].map((item) => (
                <li
                  data-hero="trust"
                  key={item}
                  className="flex items-center gap-2 text-[13px] font-medium text-ink-700"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-mint/25 text-[#3d7d6b] dark:text-[#7fd1bb]">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Live matcher demo (the signature) ──────────── */}
          <div data-hero="matcher" className="lg:justify-self-end">
            <MatcherCard onGetStarted={onGetStarted} />
          </div>
        </div>

        {/* Stats — real product numbers, count up when the hero lands */}
        <dl className="mt-10 grid grid-cols-2 gap-3 border-t border-ink-900/10 pt-7 sm:grid-cols-4 max-md:mt-7 max-md:pt-5">
          {HERO_STATS.map((stat) => (
            <div data-hero="stat" key={stat.label} className="max-md:pr-2">
              <dd
                data-hero="stat-num"
                data-value={stat.value}
                className="font-display text-2xl font-bold tracking-tight text-ink-900 max-md:text-xl"
              >
                {stat.value}
              </dd>
              <dt className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400 max-md:text-[10px]">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      {/* Below-the-fold quick actions, kept quiet */}
      <div className="mt-4 hidden items-center justify-between gap-3 text-[13px] text-ink-400 md:flex">
        <span className="flex items-center gap-2">
          <Languages className="h-4 w-4" strokeWidth={1.5} />
          বাংলা · हिन्दी · English · voice input
        </span>
        <button
          onClick={onGuestDemo}
          className="font-semibold text-ink-700 underline decoration-ink-400/30 underline-offset-4 transition-colors duration-150 hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
        >
          Just looking? Explore the demo dashboard →
        </button>
        <button
          onClick={onTrackComplaint}
          className="font-semibold text-ink-700 underline decoration-ink-400/30 underline-offset-4 transition-colors duration-150 hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
        >
          Track a complaint without signing in →
        </button>
      </div>
    </section>
  )
}

/* ── The live matcher card ─────────────────────────────────── */

function MatcherCard({ onGetStarted }: { onGetStarted: () => void }) {
  const scope = useReveal<HTMLDivElement>()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      const el = scope.current
      if (!el) return
      const promptEl = el.querySelector<HTMLElement>('[data-match="prompt"]')
      const full = promptEl?.dataset.full ?? ''

      /* Hidden initial states — applied in a layout effect, before paint,
         so there is no flash of the final state. */
      if (promptEl) promptEl.textContent = ''
      gsap.set('[data-match="parse"]', { opacity: 0 })
      gsap.set('[data-match="result"]', { opacity: 0, y: 14 })
      gsap.set('[data-match="note"]', { opacity: 0 })
      gsap.set('[data-match="count"]', { textContent: '0' })

      const tl = gsap.timeline({
        delay: 0.55,
        defaults: { ease: 'power2.out' },
      })

      /* 1. Type the prompt character by character (linear, no bounce). */
      if (promptEl) {
        const proxy = { i: 0 }
        tl.to(
          proxy,
          {
            i: full.length,
            duration: 2.2,
            ease: 'none',
            onUpdate: () => {
              const n = Math.round(proxy.i)
              promptEl.textContent =
                full.slice(0, n) + (n < full.length ? '▍' : '')
            },
          },
          0.1,
        )
      }

      /* 2. Parsing shimmer — label fades in, line sweeps across. */
      tl.to('[data-match="parse"]', { opacity: 1, duration: 0.25 }, 2.45)
      tl.fromTo(
        '[data-match="line"]',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.55, ease: 'power2.inOut', transformOrigin: 'left center' },
        2.55,
      )

      /* 3. Matched cards pop in, count ticks up to 4. */
      tl.to(
        '[data-match="result"]',
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.09 },
        3.2,
      )
      tl.to(
        '[data-match="count"]',
        {
          textContent: 4,
          duration: 0.8,
          ease: 'power2.out',
          snap: { textContent: 1 },
        },
        3.35,
      )

      /* 4. Footer note. */
      tl.to('[data-match="note"]', { opacity: 1, duration: 0.3 }, 3.75)
    },
    { scope },
  )

  return (
    <div
      ref={scope}
      className="w-full max-w-[440px] rounded-[24px] border border-border-subtle bg-surface p-5 shadow-lift md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-orange">
            Live demo
          </p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900">
            The AI scheme matcher
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
          <Sparkles className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </div>

      {/* Typed prompt, styled like a chat bubble */}
      <div className="mt-4 flex items-start gap-2.5">
        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-navy-contrast dark:bg-[#16151b]">
          <MessageSquareText className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <div
          data-match="prompt"
          data-full={DEMO_PROMPT}
          className="min-h-[52px] flex-1 rounded-2xl rounded-tl-md bg-canvas/80 px-3.5 py-3 text-[13px] leading-relaxed text-ink-900"
          aria-label="Demo prompt: describing a household to the matcher"
        >
          {DEMO_PROMPT}
        </div>
      </div>

      {/* Parsing shimmer */}
      <div data-match="parse" className="mt-4 flex items-center gap-2.5">
        <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-brand-orange" />
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Parsing eligibility rules…
        </span>
        <div className="h-px flex-1 overflow-hidden rounded-full bg-ink-900/10">
          <div data-match="line" className="h-full w-full bg-brand-orange" />
        </div>
      </div>

      {/* Match results */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mint/20 px-3 py-1 text-[11px] font-bold text-[#3d7d6b] dark:text-[#7fd1bb]">
            <Check className="h-3 w-3" strokeWidth={3} />
            <span>
              <span data-match="count">4</span> matches found
            </span>
          </span>
          <span className="text-[11px] text-ink-400">866 schemes scanned</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {DEMO_MATCHES.map((m) => {
            const Illo = ILLUSTRATIONS[m.illustration]
            return (
              <div
                data-match="result"
                key={m.title}
                className={`relative overflow-hidden rounded-2xl p-3 ${m.color}`}
              >
                <Illo className="pointer-events-none absolute -bottom-2 -right-2 h-16 w-16 text-white/35" />
                <p className="text-[11px] font-bold leading-tight text-ink-900">
                  {m.title}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-ink-700">
                  {m.benefit}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer note + CTA */}
      <p
        data-match="note"
        className="mt-4 text-[11px] leading-relaxed text-ink-400"
      >
        Ask in বাংলা, हिन्दी or English — typing or voice. Your real matches
        are verified against the original scheme documents.
      </p>
      <button
        onClick={onGetStarted}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-navy-contrast transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#2d2839] hover:shadow-lift focus-visible:outline-2 focus-visible:outline-brand-orange dark:hover:bg-[#d9d5cd]"
      >
        Check out all the schemes
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  )
}

/* ── Scheme-name ticker ────────────────────────────────────── */

function Ticker() {
  const scope = useReveal<HTMLDivElement>()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const track = scope.current?.querySelector<HTMLElement>(
          '[data-ticker-track]',
        )
        if (!track) return
        gsap.to(track, {
          xPercent: -50,
          duration: 34,
          ease: 'none',
          repeat: -1,
        })
      })
    },
    { scope },
  )

  /* Reduced motion: a static, wrapping list instead of a marquee. */
  const Items = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
    <span
      className="flex items-center"
      aria-hidden={ariaHidden || undefined}
    >
      {TICKER_NAMES.map((name) => (
        <span key={name} className="flex items-center">
          <span className="whitespace-nowrap font-display text-sm font-bold uppercase tracking-[0.14em] text-ink-400">
            {name}
          </span>
          <span className="mx-6 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange/70" />
        </span>
      ))}
    </span>
  )

  return (
    <div
      ref={scope}
      className="mt-12 border-y border-border-subtle/70 bg-canvas-alt/40 py-5 max-md:mt-8"
      aria-label="Schemes you can access through SevaNest"
    >
      {prefersReducedMotion() ? (
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-2 gap-y-3 px-4">
          <Items />
        </div>
      ) : (
        <div className="overflow-hidden">
          <div data-ticker-track className="flex w-max">
            <Items />
            <Items ariaHidden />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── How it works — a real 3-step sequence, numbers earned ─── */

function HowItWorks() {
  const scope = useReveal<HTMLElement>()

  return (
    <section
      id="how-it-works"
      ref={scope}
      className="mx-auto w-full max-w-[1200px] scroll-mt-20 px-4 pt-16 md:px-6 md:pt-24"
    >
      <SectionHeader
        eyebrow="How it works"
        title="Three steps. No running around."
        sub="No queues, no touts, no “come back next week”. Just your details and the schemes that fit."
      />

      <ol className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-5">
        {HOW_STEPS.map((step, i) => (
          <li
            data-reveal
            key={step.title}
            className="relative flex flex-col rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="font-display text-4xl font-bold tracking-tight text-ink-900">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="mt-1 h-1 w-8 rounded-full bg-brand-orange" />
            <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
              {step.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
              {step.text}
            </p>
            <p className="mt-auto pt-4 text-[11px] font-bold uppercase tracking-wider text-ink-400">
              {step.meta}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ── What's inside — pastel category cards (design.md §2) ──── */

function CatalogPreview() {
  const scope = useReveal<HTMLElement>()

  return (
    <section
      id="catalog"
      ref={scope}
      className="mx-auto w-full max-w-[1200px] scroll-mt-20 px-4 pt-16 md:px-6 md:pt-24"
    >
      <SectionHeader
        eyebrow="What's inside"
        title="Eight doors into the catalog."
        sub="Every scheme lives in a category. Here is what a matched household typically sees."
      />

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
        {CATEGORY_CARDS.map((card) => {
          const Illo = ILLUSTRATIONS[card.illustration]
          return (
            <div
              data-reveal
              key={card.category}
              className={`relative min-h-36 overflow-hidden rounded-2xl p-4 transition-transform duration-150 hover:-translate-y-0.5 md:min-h-40 md:p-5 ${card.color}`}
            >
              <Illo className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-white/40" />
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-900/70">
                {card.category}
              </p>
              <p className="mt-2 font-display text-[15px] font-bold leading-snug text-ink-900 md:text-base">
                {card.example}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold text-ink-700">
                {card.benefit}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ── Grievance redressal — the second half of the product ──── */

function GrievanceSection({
  onAnonComplaint,
  onTrackComplaint,
}: {
  onAnonComplaint: () => void
  onTrackComplaint: () => void
}) {
  const scope = useReveal<HTMLElement>()
  const live = complaints.find((c) => c.ref === 'SR-1041') ?? complaints[0]
  const open = complaints.filter((c) => c.status === 'Open').length
  const reviewing = complaints.filter((c) => c.status === 'Under review').length
  const resolved = complaints.filter((c) => c.status === 'Resolved').length

  return (
    <section
      id="complaints"
      ref={scope}
      className="mx-auto w-full max-w-[1200px] scroll-mt-20 px-4 pt-16 md:px-6 md:pt-24"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div data-reveal>
          <SectionHeader
            eyebrow="Grievance redressal"
            title="Something not working? Say it once, watch it move."
            sub="Street light out? Ration delayed? Water disrupted? Report it with a photo. We assign it, you get SMS updates, and it escalates automatically if it is not resolved in 7 days."
          />

          <ul className="mt-6 flex flex-col gap-3">
            {[
              'Photo & location evidence in one step',
              'SMS updates at every stage, in your language',
              'Auto-escalation to the block officer at day 7',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[14px] font-medium text-ink-700"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-mint/25 text-[#3d7d6b] dark:text-[#7fd1bb]">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onAnonComplaint}
              className="flex items-center gap-2 rounded-2xl bg-brand-navy px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-navy-contrast shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#2d2839] hover:shadow-lift focus-visible:outline-2 focus-visible:outline-brand-orange dark:hover:bg-[#d9d5cd]"
            >
              Report an issue
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              onClick={onTrackComplaint}
              className="text-[13px] font-semibold text-[#b06a34] underline decoration-brand-orange/40 underline-offset-4 transition-colors duration-150 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange dark:text-[#f0a468]"
            >
              Track a complaint
            </button>
          </div>
        </div>

        {/* Live complaint preview card */}
        <div data-reveal className="lg:justify-self-end">
          <div className="w-full max-w-[440px] rounded-[24px] border border-border-subtle bg-surface p-5 shadow-lift md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-orange">
                  Live on your dashboard
                </p>
                <p className="mt-1 font-display text-lg font-bold text-ink-900">
                  A complaint, in motion
                </p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                <Phone className="h-5 w-5" strokeWidth={1.75} />
              </span>
            </div>

            <div className="mt-4 rounded-2xl bg-canvas/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold text-ink-900">
                    {live.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {live.ref} · {live.location}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-orange/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                  Day {live.days} of 7
                </span>
              </div>
              {/* No data-progress here on purpose: useReveal would animate
                  the fill to 100% and override the real 6/7 standing fill
                  (useReveal animates [data-progress] bars to scaleX(1)). */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-900/10">
                <div
                  className="h-full w-full origin-left rounded-full bg-brand-orange"
                  style={{ transform: `scaleX(${Math.min(1, live.days / 7)})` }}
                />
              </div>
              <p className="mt-2.5 text-[11px] font-semibold text-[#b06a34] dark:text-[#f0a468]">
                {live.days >= 6
                  ? 'Escalates to the block officer tomorrow.'
                  : 'Assigned · field officer reviewing on site.'}
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Open', count: open, dot: 'bg-brand-navy' },
                { label: 'Under review', count: reviewing, dot: 'bg-brand-orange' },
                { label: 'Resolved', count: resolved, dot: 'bg-brand-mint' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-canvas/60 px-2 py-2.5 text-center"
                >
                  <dd className="font-display text-base font-bold text-ink-900">
                    {s.count}
                  </dd>
                  <dt className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-ink-400">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CTA band ──────────────────────────────────────────────── */

function CtaBand({
  onGetStarted,
  onAnonComplaint,
}: {
  onGetStarted: () => void
  onAnonComplaint: () => void
}) {
  const scope = useReveal<HTMLElement>()

  return (
    <section
      ref={scope}
      className="mx-auto w-full max-w-[1200px] px-4 pt-16 md:px-6 md:pt-24"
    >
      <div
        data-reveal
        className="relative overflow-hidden rounded-[28px] bg-brand-navy px-6 py-12 text-center text-navy-contrast shadow-lift md:px-10 md:py-16"
      >
        {/* Quiet line-art on the navy band (design.md §8) */}
        <svg
          viewBox="0 0 240 240"
          className="pointer-events-none absolute -right-14 -top-16 h-72 w-72 text-brand-mint opacity-25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M120 120 m-30 0 a30 30 0 1 1 60 0 a42 42 0 1 1 -84 0 a54 54 0 1 1 108 0" />
        </svg>
        <svg
          viewBox="0 0 160 80"
          className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-44 text-brand-orange opacity-30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M5 40 C 30 15, 55 65, 80 40 S 130 15, 155 40" />
        </svg>

        <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-bold leading-[1.08] tracking-tight md:text-5xl">
          Your welfare money is out there.
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-navy-contrast/70">
          866+ schemes. One short conversation. Let&rsquo;s find yours.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 rounded-2xl bg-surface px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-brand-navy shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-brand-orange dark:bg-[#16151b] dark:text-navy-contrast"
          >
            Get started — it&rsquo;s free
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={onAnonComplaint}
            className="text-[13px] font-semibold text-navy-contrast/80 underline decoration-navy-contrast/30 underline-offset-4 transition-colors duration-150 hover:text-navy-contrast focus-visible:outline-2 focus-visible:outline-brand-orange"
          >
            or file a complaint anonymously
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ────────────────────────────────────────────────── */

const HELPLINES = [
  { label: 'Police (emergency)', number: '100' },
  { label: 'Women helpline', number: '1091' },
  { label: 'Emergency response', number: '112' },
  { label: 'Cybercrime fraud', number: '1930' },
]

function LandingFooter({ onGuestDemo }: { onGuestDemo: () => void }) {
  return (
    <footer className="mx-auto mt-16 w-full max-w-[1200px] px-4 pb-10 md:px-6 md:mt-24">
      <div className="grid gap-10 border-t border-border-subtle pt-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-700">
            Welfare access &amp; transparent grievance redressal for every
            household — in your language, on any phone, at no cost.
          </p>
          <button
            onClick={onGuestDemo}
            className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-[#b06a34] transition-colors duration-150 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange dark:text-[#f0a468]"
          >
            Explore the demo dashboard
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <nav aria-label="Footer — explore">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
            Explore
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className="text-[13px] font-medium text-ink-700 transition-colors duration-150 hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  window.history.pushState(null, '', '/admin/login')
                  window.dispatchEvent(new Event('popstate'))
                }}
                className="flex items-center gap-1.5 text-[13px] font-medium text-ink-700 transition-colors duration-150 hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Officer desk
              </button>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
            Helplines
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {HELPLINES.map((h) => (
              <li key={h.number} className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-medium text-ink-700">
                  {h.label}
                </span>
                <span className="font-display text-[13px] font-bold text-ink-900">
                  {h.number}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
            Languages
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {['বাংলা', 'हिन्दी', 'English'].map((l) => (
              <li key={l} className="text-[13px] font-medium text-ink-700">
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-6 text-center md:flex-row md:text-left">
        <p className="text-xs text-ink-400">
          Free government service — never pay anyone to apply for a scheme.
        </p>
        <p className="text-xs text-ink-400">
          SevaNest · Community Platform for Welfare-Scheme Access &amp;
          Grievance Redressal · © 2026
        </p>
      </div>
    </footer>
  )
}
