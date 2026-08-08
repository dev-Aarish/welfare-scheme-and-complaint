import { useRef } from 'react'
import { Plus } from 'lucide-react'
import { GuideCard } from './GuideCard'
import { complaints, stats, user } from '../data'
import { gsap, useGSAP } from '../lib/animations'

/* Status strip on mobile mirrors the ComplaintRow grammar (dot + label). */
const STATUS_STRIP = [
  { label: 'Open', status: 'Open' as const, dot: 'bg-brand-navy' },
  {
    label: 'Under review',
    status: 'Under review' as const,
    dot: 'bg-brand-orange',
  },
  { label: 'Resolved', status: 'Resolved' as const, dot: 'bg-brand-mint' },
]

export function Hero({ onReport }: { onReport: () => void }) {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Reduced motion: static render.
      mm.add('(prefers-reduced-motion: reduce)', () => {})

      // One signature sequence (Animations.md §3.1): eyebrow → greeting →
      // subtext → stat pills → guide card, then the numbers count up.
      mm.add(
        '(min-width: 640px) and (prefers-reduced-motion: no-preference)',
        () => {
          const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

          tl.from('[data-hero="eyebrow"]', { y: 16, opacity: 0, duration: 0.5 })
            .from(
              '[data-hero="title"]',
              { y: 16, opacity: 0, duration: 0.5 },
              '-=0.3',
            )
            .from(
              '[data-hero="sub"]',
              { y: 12, opacity: 0, duration: 0.45 },
              '-=0.35',
            )
            .from(
              '[data-hero="stat"]',
              { y: 12, opacity: 0, duration: 0.45, stagger: 0.06 },
              '-=0.3',
            )
            .from(
              '[data-hero="guide"]',
              { scale: 0.96, opacity: 0, duration: 0.5 },
              '-=0.25',
            )

          // Count-up the stat numbers once the pills land.
          const counters = gsap.utils.toArray<HTMLElement>(
            '[data-hero="stat-num"]',
            scope.current as HTMLElement,
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
                duration: 1.2,
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
        },
      )
    },
    { scope },
  )

  return (
    <section
      ref={scope}
      className="hero-band relative overflow-hidden rounded-[28px] px-6 py-10 shadow-soft md:px-10 lg:px-12 lg:py-12 max-md:rounded-[20px] max-md:px-4 max-md:py-6"
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] max-md:gap-6">
        <div>
          <span
            data-hero="eyebrow"
            className="inline-flex items-center gap-2 rounded-full bg-surface/70 px-3 py-1.5 text-xs font-medium text-ink-700 max-md:px-2.5 max-md:py-1 max-md:text-[11px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            Monday, 8 August · Bengal District Services
          </span>

          {/* Greeting lives in the mobile top bar — hidden here below lg
              so there is exactly one H1 per viewport (mobile plan §4) */}
          <h1
            data-hero="title"
            className="mt-5 font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-[40px] max-lg:hidden"
          >
            Hi, {user.name.split(' ')[0]}! 👋
          </h1>
          <p
            data-hero="sub"
            className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-700 max-md:mt-2 max-md:text-[13px]"
          >
            Here's what matters today — welfare schemes matched to your life,
            and the status of everything you've reported.
          </p>

          <dl className="mt-8 flex flex-wrap gap-3 max-md:mt-4 max-md:grid max-md:grid-cols-3 max-md:gap-2 max-md:text-center">
            {stats.map((stat) => (
              <div
                key={stat.label}
                data-hero="stat"
                className="rounded-2xl bg-surface/75 px-4 py-3 backdrop-blur-sm max-md:rounded-xl max-md:px-2 max-md:py-2"
              >
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-400 max-md:text-[10px] max-md:leading-tight max-md:tracking-normal">
                  {stat.label}
                </dt>
                <dd
                  data-hero="stat-num"
                  data-value={stat.value}
                  className="mt-0.5 font-display text-xl font-semibold text-ink-900 max-md:mt-0.5 max-md:text-base"
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Desktop-only guide card — mobile plan §2: one elevated surface per
            screen, so the guide collapses to a slim strip on small screens. */}
        <div data-hero="guide" className="max-md:hidden">
          <GuideCard />
        </div>
      </div>

      {/* Mobile primary action (mobile plan §3): one unmistakable full-width
          CTA near the top, plus the status strip from the desktop legend. */}
      <div className="mt-4 lg:hidden">
        <button
          onClick={onReport}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-brand-navy px-5 py-3.5 text-[13px] font-semibold text-navy-contrast transition-colors duration-150 hover:bg-[#2d2839] focus-visible:outline-2 focus-visible:outline-brand-orange dark:hover:bg-[#d9d5cd]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Report an issue
        </button>

        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar"
          aria-label="Report status counts"
        >
          {STATUS_STRIP.map((item) => {
            const count = complaints.filter(
              (c) => c.status === item.status,
            ).length
            return (
              <span
                key={item.label}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-border-subtle/60 bg-surface/80 px-3 py-1.5 backdrop-blur-sm"
              >
                <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                <span className="text-[12px] font-semibold text-ink-900">
                  {count}
                </span>
                <span className="text-[11px] text-ink-400">{item.label}</span>
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
