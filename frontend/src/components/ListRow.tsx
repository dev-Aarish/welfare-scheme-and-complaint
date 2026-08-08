import { ChevronRight } from 'lucide-react'
import type { IllustrationKey } from '../data'
import { ILLUSTRATIONS } from './illustrations'

/* Dot + label chips reuse the exact status grammar from the rest of the
   portal — hue is never the only signal (design.md §7). */
const CHIP_TONES = {
  mint: 'bg-brand-mint/20 text-[#3d7d6b] dark:text-[#7fd1bb]',
  orange: 'bg-brand-orange/15 text-[#b06a34] dark:text-[#f0a468]',
  navy: 'bg-brand-navy/10 text-brand-navy dark:bg-[#f2f0ec]/15 dark:text-[#f2f0ec]',
} as const

const CHIP_DOTS = {
  mint: 'bg-brand-mint',
  orange: 'bg-brand-orange',
  navy: 'bg-brand-navy dark:bg-[#f2f0ec]',
} as const

/** Compact mobile list row (mobile plan §2): leading icon in a small tinted
 *  tile, title + meta stacked left, status dot + label right, chevron.
 *  Desktop keeps the full colour-block cards — this row is `md:hidden` by
 *  the callers, so the desktop card grid is untouched. */
export function ListRow({
  tileClass,
  illustration,
  title,
  meta,
  chip,
  onClick,
}: {
  /** Solid pastel card-field class, e.g. `bg-card-lavender`. */
  tileClass: string
  illustration?: IllustrationKey
  title: string
  meta: string
  chip: { label: string; tone: keyof typeof CHIP_TONES }
  onClick?: () => void
}) {
  const Illustration = illustration ? ILLUSTRATIONS[illustration] : null
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors duration-150 active:bg-canvas/70 focus-visible:outline-2 focus-visible:outline-brand-orange"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${tileClass}`}
      >
        {Illustration && <Illustration className="h-5 w-5 text-white" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-900">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-ink-400">
          {meta}
        </span>
      </span>

      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${CHIP_TONES[chip.tone]}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${CHIP_DOTS[chip.tone]}`} />
        {chip.label}
      </span>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-ink-400"
        strokeWidth={1.5}
      />
    </button>
  )
}
