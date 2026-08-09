/**
 * Ambient thin line-art doodles on the outer page background only
 * (design.md §8) — fixed behind the app shell, never interactive.
 */
export function DecorativeBackground({
  /* The dashboard shell reserves 264px for the sidebar; the auth page is
     full-bleed, so the doodles are centred on the whole viewport there. */
  insetForSidebar = true,
}: {
  insetForSidebar?: boolean
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${
        insetForSidebar ? 'lg:left-[264px]' : ''
      }`}
    >
      {/* Concentric spiral — top-left (static; single ambient spiral, no drift) */}
      <svg
        viewBox="0 0 240 240"
        className="absolute -left-12 -top-14 h-72 w-72 text-brand-mint opacity-20 dark:opacity-10 max-md:-left-10 max-md:-top-12 max-md:h-44 max-md:w-44 max-md:opacity-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M120 120 m-30 0 a30 30 0 1 1 60 0 a42 42 0 1 1 -84 0 a54 54 0 1 1 108 0 a66 66 0 1 1 -132 0" />
      </svg>

      {/* Loose ribbon squiggle — top-right */}
      <svg
        viewBox="0 0 320 130"
        className="doodle-drift absolute -right-8 top-20 h-36 w-80 text-brand-mint opacity-15 dark:opacity-10 max-md:-right-10 max-md:top-16 max-md:h-20 max-md:w-44 max-md:opacity-10"
        style={{ animationDuration: '45s', animationDelay: '-12s' }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M10 60 C 45 20, 75 100, 105 60 S 165 20, 195 60 S 255 100, 290 55" />
        <path d="M45 95 C 75 60, 105 125, 135 95 S 195 55, 225 95" opacity="0.7" />
      </svg>

      {/* Small squiggle — bottom-left */}
      <svg
        viewBox="0 0 160 80"
        className="doodle-drift absolute bottom-12 left-10 h-16 w-36 text-brand-mint opacity-15 dark:opacity-10 max-md:bottom-8 max-md:left-6 max-md:h-12 max-md:w-24 max-md:opacity-10"
        style={{ animationDuration: '29s', animationDelay: '-5s' }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M5 40 C 30 15, 55 65, 80 40 S 130 15, 155 40" />
      </svg>
    </div>
  )
}
