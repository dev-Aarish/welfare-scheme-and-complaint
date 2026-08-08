import { useEffect, useRef, useState, type RefObject } from 'react'
import { Mic, ShieldCheck } from 'lucide-react'
import { gsap } from '../lib/animations'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface ComplaintBarProps {
  query: string
  onQueryChange: (value: string) => void
  inputRef: RefObject<HTMLInputElement | null>
}

export function ComplaintBar({
  query,
  onQueryChange,
  inputRef,
}: ComplaintBarProps) {
  const [filed, setFiled] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const reducedMotion = useReducedMotion()

  /* Success pill slides down into place (Animations.md §3.1). */
  useEffect(() => {
    if (!filed || reducedMotion) return
    gsap.from('[data-success-pill]', {
      y: -8,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
    })
  }, [filed, reducedMotion])

  const fileComplaint = () => {
    if (filed) return
    setFiled(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setFiled(false), 5000)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="mt-5">
      <div className="search-pulse flex items-center gap-1.5 rounded-[20px] border border-border-subtle bg-surface p-1.5 shadow-soft">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Type a scheme name, or describe an issue — road, water, harassment…"
          aria-label="Search schemes or describe an issue"
          className="w-full min-w-0 flex-1 bg-transparent px-4 py-3.5 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none max-md:px-3 max-md:py-3 max-md:text-[13px]"
        />
        <button
          type="button"
          title="Voice input — multilingual assistant"
          aria-label="Voice input"
          className="hidden shrink-0 items-center justify-center rounded-[12px] border border-border-subtle p-2.5 text-ink-700 transition-colors duration-150 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand-orange sm:flex"
        >
          <Mic className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={fileComplaint}
          className="shrink-0 rounded-[14px] bg-brand-navy px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-navy-contrast transition-colors duration-150 hover:bg-[#2d2839] dark:hover:bg-[#d9d5cd] focus-visible:outline-2 focus-visible:outline-brand-orange md:px-8 max-md:px-4 max-md:py-3 max-md:normal-case max-md:tracking-normal"
        >
          File a complaint
        </button>
      </div>

      <p className="mt-2.5 text-xs text-ink-400 max-md:text-[11px]">
        Anonymous &amp; geotagged — your name is never shown to officials.{' '}
        <button className="font-medium text-brand-navy underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-brand-orange">
          How it works
        </button>
      </p>

      {filed && (
        <p
          data-success-pill
          role="status"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-mint/20 px-4 py-2 text-[13px] font-medium text-ink-900"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand-navy" />
          Complaint filed anonymously — reference{' '}
          <strong>SR-1045</strong>. You'll get SMS updates at every step.
        </p>
      )}
    </div>
  )
}
