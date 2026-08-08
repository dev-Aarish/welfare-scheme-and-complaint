import { BadgeCheck, Check, Lock } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { officer, officerAccess, officerPerformance, officerProfile } from '../../data'
import { useReveal } from '../../hooks/useReveal'

export function OfficerProfilePage() {
  const scope = useReveal<HTMLDivElement>()

  return (
    <div>
      <PageHeader
        title="My profile"
        subtitle="Your staff record — posting, access and this month's service performance. Citizens never see this."
      />

      <div
        ref={scope}
        className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3 max-md:mt-5 max-md:gap-4"
      >
        <div className="flex flex-col gap-5">
          <div data-reveal>
            <OfficerSummary />
          </div>
          <div data-reveal>
            <PerformanceCard />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-2">
          <div data-reveal>
            <InfoCard title="Employment details" rows={officerProfile.employment} />
          </div>
          <div data-reveal>
            <InfoCard title="Posting & jurisdiction" rows={officerProfile.posting} />
          </div>
          <div data-reveal>
            <InfoCard title="Contact" rows={officerProfile.contact} />
          </div>
          <div data-reveal>
            <AccessCard />
          </div>
        </div>
      </div>
    </div>
  )
}

function OfficerSummary() {
  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <div className="relative inline-block">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-[#c97a45] text-xl font-semibold text-white">
          {officer.initials}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-brand-navy dark:bg-[#16151b]">
          <BadgeCheck className="h-3 w-3 text-brand-mint" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold text-ink-900">
          {officer.name}
        </h2>
      </div>
      <p className="mt-1 text-[13px] text-ink-400">
        Block Officer · Uluberia-I · Howrah
      </p>

      <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-canvas/70 px-4 py-3">
        <Check className="h-4 w-4 shrink-0 text-brand-mint" strokeWidth={2.5} />
        <p className="text-[13px] font-semibold text-ink-900">
          Verified staff record · gazetted
        </p>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        Your designation and response times are public on the portal. Your
        employee ID and contact details are never shown to citizens.
      </p>
    </div>
  )
}

function PerformanceCard() {
  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <h3 className="font-display text-base font-semibold text-ink-900">
        This month
      </h3>
      <p className="mt-1 text-xs text-ink-400">
        Service performance for Uluberia-I.
      </p>
      <ul className="mt-4 flex flex-col gap-4">
        {officerPerformance.map((stat) => (
          <li key={stat.label}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-ink-700">{stat.label}</span>
              <span className="font-display text-base font-semibold text-ink-900">
                {stat.value}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas">
              <div
                data-progress
                className="h-full rounded-full bg-brand-mint"
                style={{ width: `${stat.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InfoCard({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <h3 className="font-display text-base font-semibold text-ink-900">
        {title}
      </h3>
      <dl className="mt-4 flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3 border-b border-border-subtle/70 pb-2.5 last:border-0 last:pb-0"
          >
            <dt className="shrink-0 text-[13px] text-ink-400">{row.label}</dt>
            <dd className="text-right text-[13px] font-medium text-ink-900">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function AccessCard() {
  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <h3 className="font-display text-base font-semibold text-ink-900">
        Access &amp; permissions
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {officerAccess.map((perm) => (
          <li
            key={perm.label}
            className="flex items-center gap-3 rounded-xl bg-canvas/60 px-3.5 py-2.5"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                perm.granted
                  ? 'bg-brand-mint/25 text-[#3d7d6b] dark:text-[#7fd1bb]'
                  : 'bg-brand-orange/20 text-[#b06a34] dark:text-[#f0a468]'
              }`}
            >
              {perm.granted ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <Lock className="h-3.5 w-3.5" strokeWidth={2} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-ink-900">
                {perm.label}
              </span>
            </span>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                perm.granted
                  ? 'bg-brand-mint/20 text-[#3d7d6b] dark:text-[#7fd1bb]'
                  : 'bg-brand-orange/15 text-[#b06a34] dark:text-[#f0a468]'
              }`}
            >
              {perm.granted ? 'Granted' : 'Restricted'}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        Restricted actions require district-level authorisation and are
        audited.
      </p>
    </div>
  )
}
