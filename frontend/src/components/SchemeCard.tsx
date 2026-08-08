import { ChevronRight } from 'lucide-react'
import type { Scheme } from '../data'
import { ILLUSTRATIONS } from './illustrations'

export const CARD_COLORS: Record<Scheme['color'], string> = {
  lavender: 'bg-card-lavender',
  olive: 'bg-card-olive',
  terracotta: 'bg-card-terracotta',
  sage: 'bg-card-sage',
  mauve: 'bg-card-mauve',
  khaki: 'bg-card-khaki',
}

export function SchemeCard({ scheme, onClick }: { scheme: Scheme; onClick?: () => void }) {
  const Illustration = ILLUSTRATIONS[scheme.illustration] || ILLUSTRATIONS.spiral
  return (
    <button
      onClick={onClick}
      className={`group relative flex h-full w-full min-h-44 flex-col overflow-hidden rounded-2xl p-6 text-left transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-brand-orange ${CARD_COLORS[scheme.color]} max-md:hidden`}
    >
      <span className="self-start rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
        {scheme.match}
      </span>
      <ChevronRight
        className="absolute right-5 top-5 h-5 w-5 text-white/70 transition-transform duration-150 group-hover:translate-x-0.5"
        strokeWidth={2}
      />

      <div className="mt-auto">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
          {scheme.tag}
        </p>
        <h3 className="mt-1 max-w-[80%] text-[15px] font-semibold leading-snug text-white">
          {scheme.title}
        </h3>
        <p className="mt-1.5 text-xs font-medium text-white/85">
          {scheme.benefit}
        </p>
      </div>

      <Illustration className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 text-white opacity-40 transition-transform duration-150 group-hover:scale-105" />
    </button>
  )
}
