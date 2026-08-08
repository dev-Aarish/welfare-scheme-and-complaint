import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches
}

/**
 * Reactive `prefers-reduced-motion` flag (Animations.md §4 Phase 0).
 * Every animation in the app is gated on it, either through this hook or
 * through `gsap.matchMedia()` in the shared context.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
