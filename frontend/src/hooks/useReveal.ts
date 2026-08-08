import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../lib/animations'

interface RevealOptions {
  /** Selector for the items to reveal. Defaults to `[data-reveal]`. */
  targets?: string
  /** Vertical offset before the reveal starts. */
  y?: number
  /** Stagger between items in seconds. */
  stagger?: number
  /** Fade-up duration in seconds. */
  duration?: number
  /** ScrollTrigger start position. */
  start?: string
}

/**
 * Scroll-triggered reveal (Animations.md §3.1 — "Section scroll reveals").
 *
 * Targets `[data-reveal]` elements inside the scope and:
 *  - fades them up with a stagger when the section scrolls into view
 *  - pops `[data-pop]` descendants (e.g. the resolved check) into place
 *  - draws `[data-progress]` bars in from the left (transform-only, GPU friendly)
 *
 * Fully disabled for `prefers-reduced-motion` via `gsap.matchMedia()`.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {},
) {
  const scope = useRef<T>(null)
  const {
    targets = '[data-reveal]',
    y = 24,
    stagger = 0.07,
    duration = 0.55,
    start = 'top 88%',
  } = options

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Reduced motion: render statically, no timelines.
      mm.add('(prefers-reduced-motion: reduce)', () => {})

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>(
          targets,
          scope.current as HTMLElement,
        )
        if (!items.length) return

        ScrollTrigger.batch(items, {
          start,
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { y, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration,
                ease: 'power2.out',
                stagger,
                overwrite: true,
              },
            )

            // Resolved check "pop" (Animations.md §3.1).
            const pops = batch.flatMap((el) =>
              gsap.utils.toArray<HTMLElement>('[data-pop]', el),
            )
            if (pops.length) {
              gsap.fromTo(
                pops,
                { scale: 0.5, opacity: 0 },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 0.3,
                  ease: 'power2.out',
                  stagger: 0.05,
                  delay: 0.12,
                  overwrite: true,
                },
              )
            }

            // Progress bars draw in from the left (Animations.md §3.2).
            const bars = batch.flatMap((el) =>
              gsap.utils.toArray<HTMLElement>('[data-progress]', el),
            )
            if (bars.length) {
              gsap.fromTo(
                bars,
                { scaleX: 0 },
                {
                  scaleX: 1,
                  duration: 0.7,
                  ease: 'power2.out',
                  transformOrigin: 'left center',
                  overwrite: true,
                },
              )
            }
          },
        })
      })
    },
    { scope },
  )

  return scope
}
