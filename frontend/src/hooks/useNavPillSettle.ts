import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/animations'
import type { TabId } from '../data'

/**
 * Softly settles the active nav pill into place whenever the tab changes
 * (Animations.md §3.2). Shared by the desktop Sidebar and the MobileHeader
 * so the interaction language stays identical. Returns the scope ref to
 * attach to the nav container.
 */
export function useNavPillSettle(active: TabId) {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {})
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const pill = scope.current?.querySelector<HTMLElement>(
          '[aria-current="page"]',
        )
        if (pill) {
          gsap.from(pill, {
            scale: 0.96,
            opacity: 0.7,
            duration: 0.25,
            ease: 'power2.out',
            transformOrigin: 'left center',
          })
        }
      })
    },
    { scope, dependencies: [active] },
  )

  return scope
}
