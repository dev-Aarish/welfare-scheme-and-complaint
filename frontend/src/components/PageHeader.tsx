export function PageHeader({
  title,
  subtitle,
  count,
}: {
  title: string
  subtitle?: string
  count?: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 max-md:text-[22px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-400 max-md:mt-1 max-md:text-[13px]">
            {subtitle}
          </p>
        )}
      </div>
      {count && (
        <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink-700 shadow-soft">
          {count}
        </span>
      )}
    </div>
  )
}
