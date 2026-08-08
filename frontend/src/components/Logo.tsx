export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-brand-navy dark:bg-[#16151b]">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-brand-orange"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M12 12 m-4 0 a4 4 0 1 1 8 0 a6 6 0 1 1 -12 0 a8 8 0 1 1 16 0" />
        </svg>
      </div>
      <div className="min-w-0 leading-none">
        <p className="truncate font-display text-[22px] font-bold tracking-tight text-ink-900">
          Seva<span className="text-brand-orange">Nest</span>
        </p>
        <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">
          welfare, made simple
        </p>
      </div>
    </div>
  )
}
