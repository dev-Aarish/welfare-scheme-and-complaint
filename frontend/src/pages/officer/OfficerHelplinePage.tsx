import { LifeBuoy } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { useReveal } from '../../hooks/useReveal'
import {
  emergencyContacts,
  officerEscalationSteps,
  officerStats,
  officerSupportContacts,
} from '../../data'

export function OfficerHelplinePage() {
  const scope = useReveal<HTMLDivElement>()

  return (
    <div>
      <PageHeader
        title="Helpline"
        subtitle="Internal support for your desk — plus the emergency lines every officer and citizen can call."
      />

      {/* Service window banner */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-brand-mint/20 px-5 py-4 max-md:mt-5 max-md:px-4 max-md:py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-orange dark:bg-[#16151b]">
          <LifeBuoy className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <p className="text-[13px] leading-relaxed text-ink-900">
          <strong>7-day service window.</strong> Reports you don't act on
          escalate to the district desk automatically — every action you take
          is logged publicly.
        </p>
      </div>

      <div ref={scope} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Internal support */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div
            data-reveal
            className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4"
          >
            <h3 className="font-display text-base font-semibold text-ink-900">
              Internal support
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {officerSupportContacts.map((contact) => {
                const Icon = contact.icon
                return (
                  <li key={contact.number}>
                    <a
                      href={`tel:${contact.number}`}
                      className="flex w-full items-center gap-3 rounded-xl bg-canvas/60 px-4 py-3 text-left transition-colors duration-150 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand-orange"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-orange dark:bg-[#16151b]">
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                      <span className="flex-1 text-[13px] font-medium text-ink-900">
                        {contact.label}
                      </span>
                      <span className="font-display text-base font-semibold text-ink-900">
                        {contact.number}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-xs text-ink-400">
              District helpdesk · office hours 9:00–18:00
            </p>
          </div>

          {/* Escalation chain */}
          <div
            data-reveal
            className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4"
          >
            <h3 className="font-display text-base font-semibold text-ink-900">
              How resolution works
            </h3>
            <ol className="mt-4 flex flex-col gap-4">
              {officerEscalationSteps.map((step, i) => (
                <li key={step.title} className="relative flex gap-3 pl-1">
                  {i < officerEscalationSteps.length - 1 && (
                    <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border-subtle" />
                  )}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy font-display text-sm font-semibold text-white dark:bg-[#16151b]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink-900">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-400">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-5">
          <div
            data-reveal
            className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4"
          >
            <h3 className="font-display text-base font-semibold text-ink-900">
              Your desk today
            </h3>
            <dl className="mt-4 grid grid-cols-3 gap-2">
              {officerStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-canvas/60 px-2 py-2.5 text-center"
                >
                  <dd className="font-display text-base font-semibold text-ink-900">
                    {stat.value}
                  </dd>
                  <dt className="mt-0.5 text-[10px] leading-tight text-ink-400">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              SR-1041 is on Day 6 of 7 — resolve it today to keep it in your
              block.
            </p>
          </div>

          <div
            data-reveal
            className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4"
          >
            <h3 className="font-display text-base font-semibold text-ink-900">
              Emergency contacts
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {emergencyContacts.map((contact) => {
                const Icon = contact.icon
                return (
                  <li key={contact.number}>
                    <a
                      href={`tel:${contact.number}`}
                      className="flex w-full items-center gap-3 rounded-xl bg-canvas/60 px-4 py-3 text-left transition-colors duration-150 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand-orange"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-orange dark:bg-[#16151b]">
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                      <span className="flex-1 text-[13px] font-medium text-ink-900">
                        {contact.label}
                      </span>
                      <span className="font-display text-lg font-semibold text-ink-900 max-md:text-base">
                        {contact.number}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-xs text-ink-400">
              Tap to call · works 24×7
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
