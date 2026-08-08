import { useState } from 'react'
import { BadgeCheck, Check, Clock3, Pencil } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Toggle } from '../components/Toggle'
import { FamilyMembersCard } from '../components/FamilyMembersCard'
import { profile, user, type ProfileRow } from '../data'
import { useAuth } from '../context/AuthContext'
import { useReveal } from '../hooks/useReveal'

export function ProfilePage() {
  const [share, setShare] = useState(true)
  const { guest, profile: localProfile, identity } = useAuth()
  const verified = profile.documents.filter((d) => d.status === 'Verified').length
  const total = profile.documents.length
  const scope = useReveal<HTMLDivElement>()

  if (!guest) return <RealProfile localProfile={localProfile} identity={identity} />

  return (
    <div>
      <PageHeader
        title="My profile"
        subtitle="This profile powers every eligibility match you see. Keep your family profile accurate for scheme matching."
      />

      <div
        ref={scope}
        className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3 max-md:mt-5 max-md:gap-4"
      >
        <div className="flex flex-col gap-5">
          <div data-reveal>
            <ProfileSummary
              share={share}
              onToggleShare={() => setShare(!share)}
              name={user.name}
              initials={user.initials}
              meta={user.meta}
            />
          </div>
          <div data-reveal>
            <EligibilityFactors />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-2">
          <div data-reveal className="col-span-full">
            <FamilyMembersCard sampleFallback />
          </div>
          <div data-reveal>
            <InfoCard title="Personal details" rows={profile.personal} />
          </div>
          <div data-reveal>
            <InfoCard title="Address & household" rows={profile.household} />
          </div>
          <div data-reveal>
            <IncomeCard />
          </div>
          <div data-reveal>
            <DocumentsCard verified={verified} total={total} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSummary({
  share,
  onToggleShare,
  name,
  initials,
  meta,
}: {
  share: boolean
  onToggleShare: () => void
  name: string
  initials: string
  meta: string
}) {
  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <div className="relative inline-block">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-[#c97a45] text-xl font-semibold text-white">
          {initials}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-surface bg-brand-mint" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold text-ink-900">
          {name}
        </h2>
        <BadgeCheck className="h-5 w-5 text-brand-mint" strokeWidth={1.75} />
      </div>
      <p className="mt-1 text-[13px] text-ink-400">{meta}</p>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-canvas/70 px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-ink-900">
            Share profile for matching
          </p>
          <p className="text-xs text-ink-400">Income band · location · occupation</p>
        </div>
        <Toggle
          checked={share}
          onChange={onToggleShare}
          label="Share profile for matching"
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        Your name and Aadhaar are never shown to officials — only eligibility
        factors like income band and location are used for matching.
      </p>
    </div>
  )
}

function EligibilityFactors({ factors }: { factors?: string[] }) {
  const items = factors ?? profile.factors
  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <h3 className="font-display text-base font-semibold text-ink-900">
        What powers your matches
      </h3>
      <p className="mt-1 text-xs text-ink-400">
        Factors used by the matching engine.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((factor) => (
          <li
            key={factor}
            className="flex items-center gap-2.5 rounded-full bg-brand-mint/15 px-3.5 py-2 text-[13px] font-medium text-ink-900"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-mint text-white">
              <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
            </span>
            {factor}
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
  rows: ProfileRow[]
}) {
  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <CardTitle title={title} />
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

function IncomeCard({
  occupation,
  income,
  showEligibilityLine = true,
}: {
  occupation?: ProfileRow[]
  income?: number
  showEligibilityLine?: boolean
}) {
  const rows = occupation ?? profile.occupation
  const annual = income ?? 1.4
  const pct = Math.min(100, Math.round((annual / 2) * 100))
  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <CardTitle title="Occupation & income" />
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

      {annual > 0 && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-ink-900">
              Annual income · ₹{annual.toLocaleString('en-IN', { maximumFractionDigits: 2 })}L
            </span>
            {showEligibilityLine && (
              <span className="text-ink-400">eligibility line · ₹2L</span>
            )}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas">
            <div
              data-progress
              className="h-full rounded-full bg-brand-orange"
              style={{ width: `${pct}%` }}
            />
          </div>
          {showEligibilityLine && (
            <p className="mt-2 text-xs leading-relaxed text-ink-400">
              Under the ₹2L line — qualifies you for most income-linked schemes. ✓
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function DocumentsCard({
  verified: verifiedProp,
  total: totalProp,
  items,
}: {
  verified: number
  total: number
  items?: typeof profile.documents
}) {
  const docs = items ?? profile.documents
  const verifiedCount = verifiedProp
  const totalCount = totalProp
  const pct = totalCount ? Math.round((verifiedCount / totalCount) * 100) : 0
  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-900">
          Documents checklist
        </h3>
        <span className="rounded-full bg-brand-mint/20 px-2.5 py-1 text-xs font-semibold text-[#3d7d6b] dark:text-[#7fd1bb]">
          {verifiedCount}/{totalCount} verified
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-canvas">
        <div
          data-progress
          className="h-full rounded-full bg-brand-mint"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {docs.map((doc) => {
          const isVerified = doc.status === 'Verified'
          return (
            <li
              key={doc.label}
              className="flex items-center gap-3 rounded-xl bg-canvas/60 px-3.5 py-2.5"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  isVerified
                    ? 'bg-brand-mint/25 text-[#3d7d6b] dark:text-[#7fd1bb]'
                    : 'bg-brand-orange/20 text-[#b06a34] dark:text-[#f0a468]'
                }`}
              >
                {isVerified ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink-900">
                  {doc.label}
                </span>
                <span className="block truncate text-xs text-ink-400">
                  {doc.note}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isVerified
                    ? 'bg-brand-mint/20 text-[#3d7d6b] dark:text-[#7fd1bb]'
                    : 'bg-brand-orange/15 text-[#b06a34] dark:text-[#f0a468]'
                }`}
              >
                {doc.status}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CardTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-display text-base font-semibold text-ink-900">
        {title}
      </h3>
      <button
        aria-label={`Edit ${title}`}
        className="rounded-full border border-border-subtle p-2 text-ink-400 transition-colors duration-150 hover:bg-canvas hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  )
}

/* Real (authenticated, non-demo) view — the full profile card set, like the
   guest view, but driven by the actual user's data where available. Family
   members are managed through the live backend. */
function RealProfile({
  localProfile,
  identity,
}: {
  localProfile: ReturnType<typeof useAuth>['profile']
  identity: ReturnType<typeof useAuth>['identity']
}) {
  const scope = useReveal<HTMLDivElement>()
  const [share, setShare] = useState(true)

  const verified = profile.documents.filter((d) => d.status === 'Verified').length
  const total = profile.documents.length

  const personal: ProfileRow[] = [
    { label: 'Full name', value: identity.name },
    { label: 'Email', value: localProfile?.email || '—' },
    { label: 'Phone', value: localProfile?.phone || '—' },
    { label: 'State', value: localProfile?.state || '—' },
    { label: 'Category', value: localProfile?.casteCategory || '—' },
  ]

  const household: ProfileRow[] = [
    { label: 'State', value: localProfile?.state || 'Rural household' },
    { label: 'Caste category', value: localProfile?.casteCategory || '—' },
    { label: 'Role', value: identity.meta },
  ]

  const incomeLakhs =
    localProfile?.annualIncome && localProfile.annualIncome > 0
      ? Number((localProfile.annualIncome / 100000).toFixed(2))
      : 0

  const factors: string[] = []
  if (incomeLakhs > 0 && incomeLakhs <= 2) factors.push('Income under ₹2L')
  if (localProfile?.state) factors.push(`${localProfile.state} resident`)
  if (localProfile?.casteCategory)
    factors.push(`${localProfile.casteCategory} category`)
  if (factors.length === 0) {
    factors.push('Add household details to unlock matches')
  }

  return (
    <div>
      <PageHeader
        title="My profile"
        subtitle="This profile powers every eligibility match you see. Keep your household details and family members accurate for scheme matching."
      />

      <div
        ref={scope}
        className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3 max-md:mt-5 max-md:gap-4"
      >
        <div className="flex flex-col gap-5">
          <div data-reveal>
            <ProfileSummary
              share={share}
              onToggleShare={() => setShare(!share)}
              name={identity.name}
              initials={identity.initials}
              meta={identity.meta}
            />
          </div>
          <div data-reveal>
            <EligibilityFactors factors={factors} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-2">
          <div data-reveal className="col-span-full">
            <FamilyMembersCard />
          </div>
          <div data-reveal>
            <InfoCard title="Personal details" rows={personal} />
          </div>
          <div data-reveal>
            <InfoCard title="Address & household" rows={household} />
          </div>
          <div data-reveal>
            <IncomeCard income={incomeLakhs} showEligibilityLine={incomeLakhs > 0} />
          </div>
          <div data-reveal>
            <DocumentsCard verified={verified} total={total} />
          </div>
        </div>
      </div>
    </div>
  )
}
