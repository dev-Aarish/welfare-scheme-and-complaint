import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { user } from '../data'
import { gsap, useGSAP } from '../lib/animations'

const steps = [
  { label: 'Eligibility', done: true },
  { label: 'Documents', done: true },
  { label: 'Apply', done: false },
  { label: 'Track', done: false },
]

export function GuideCard() {
  const scope = useRef<HTMLDivElement>(null)

  /* Signature moment (Animations.md §3.1): the spiral flourish draws itself,
     the progress line sweeps in, the orange dot glides to ~40%, and the step
     labels follow. Runs just after the hero guide card lands. */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {})

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          delay: 0.55,
          defaults: { ease: 'power3.inOut' },
        })

        // Stroke-draw the spiral flourish.
        const path = scope.current?.querySelector<SVGPathElement>(
          '[data-guide="path"]',
        )
        if (path) {
          const length = path.getTotalLength()
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
          tl.to(path, { strokeDashoffset: 0, duration: 0.9 }, 0)
        }

        // Progress line sweeps in from the left.
        tl.fromTo(
          '[data-guide="line"]',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, transformOrigin: 'left center' },
          0.15,
        )

        // Orange dot glides from the start to its CSS resting place (~40%, 2
        // of 4 steps done). Animates transform only: the dot keeps its final
        // `left: 40%` position in CSS and we tween `x` from the left edge.
        const track = scope.current?.querySelector<HTMLElement>(
          '[data-guide="track"]',
        )
        const dot = scope.current?.querySelector<HTMLElement>(
          '[data-guide="dot"]',
        )
        if (track && dot) {
          const lineWidth = track.getBoundingClientRect().width
          tl.fromTo(
            dot,
            { x: -lineWidth * 0.4 + 5 },
            { x: 0, duration: 0.9, ease: 'power3.inOut' },
            0.2,
          )
        }

        // Step labels fade in, left to right.
        tl.fromTo(
          '[data-guide="step"]',
          { opacity: 0, y: 6 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
            stagger: 0.06,
          },
          0.75,
        )
      })
    },
    { scope },
  )

  return (
    <div
      ref={scope}
      className="relative ml-auto w-full max-w-sm rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft"
    >
      <p className="font-display text-xl font-semibold text-ink-900">
        Your welfare guide
      </p>
      <p className="mt-1.5 text-[13px] text-ink-400">{user.meta}</p>

      {/* Thin progress path: spiral flourish → line → orange progress dot */}
      <div className="mt-7">
        <div data-guide="track" className="relative flex items-center">
          <svg
            viewBox="0 0 48 12"
            className="h-3 w-14 shrink-0 text-brand-orange"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path
              data-guide="path"
              d="M2 6 C 10 0, 18 12, 26 6 S 40 0, 46 6"
            />
          </svg>
          <div
            data-guide="line"
            className="h-px flex-1 bg-ink-900/10"
          />
          <span
            data-guide="dot"
            className="absolute left-[40%] h-2.5 w-2.5 rounded-full bg-brand-orange"
          />
        </div>
        <ol className="mt-3 flex justify-between gap-1 text-[11px] font-medium text-ink-400">
          {steps.map((step) => (
            <li
              data-guide="step"
              key={step.label}
              className={step.done ? 'text-brand-navy' : ''}
            >
              {step.done ? '✓ ' : ''}
              {step.label}
            </li>
          ))}
        </ol>
      </div>

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-[14px] bg-brand-navy px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-navy-contrast transition-colors duration-150 hover:bg-[#2d2839] dark:hover:bg-[#d9d5cd] focus-visible:outline-2 focus-visible:outline-brand-orange">
        Continue PM-Kisan application
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  )
}
