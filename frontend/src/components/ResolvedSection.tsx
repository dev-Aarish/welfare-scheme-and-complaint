import { ArrowRight } from 'lucide-react'
import { complaints } from '../data'
import { useReveal } from '../hooks/useReveal'
import { ComplaintRow } from './ComplaintRow'

export function ResolvedSection() {
  const scope = useReveal<HTMLElement>()
  return (
    <section ref={scope} className="mt-10 lg:mt-12 max-md:mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[22px] font-semibold text-ink-900 max-md:text-base">
            Your reports &amp; updates
          </h2>
          <p className="mt-1 text-sm text-ink-400 max-md:mt-0.5 max-md:text-[13px]">
            Every complaint is public, trackable and time-bound.
          </p>
        </div>
        <button className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-navy focus-visible:outline-2 focus-visible:outline-brand-orange max-md:text-[13px]">
          View public dashboard
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Mobile plan §2: rows become one continuous divided list. */}
      <ul className="mt-5 flex flex-col gap-3 max-md:mt-4 max-md:gap-0 max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-border-subtle max-md:bg-surface max-md:divide-y max-md:divide-border-subtle">
        {complaints.map((complaint) => (
          <li data-reveal key={complaint.id}>
            <ComplaintRow complaint={complaint} />
          </li>
        ))}
      </ul>
    </section>
  )
}
