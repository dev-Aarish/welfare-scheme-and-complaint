import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

/* Register plugins exactly once (Animations.md §7 — src/lib/animations.ts). */
gsap.registerPlugin(useGSAP, ScrollTrigger, Flip)

/** True when the OS requests reduced motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * One-shot "press" feedback for selectable pills/chips
 * (Animations.md §3.2 — catalog & helpline chip selection).
 */
export function pressChip(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return
  gsap.fromTo(
    el,
    { scale: 0.92 },
    { scale: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' },
  )
}

export { gsap, useGSAP, ScrollTrigger, Flip }
