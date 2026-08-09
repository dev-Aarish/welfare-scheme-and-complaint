import { useEffect, useRef, useState } from 'react'
import {
  BadgeCheck,
  Banknote,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  IdCard,
  Landmark,
  Loader2,
  Lock,
  ScrollText,
  Sparkles,
  Trash2,
  Upload,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { catalogSchemes, profile } from '../data'
import { useAuth } from '../context/AuthContext'
import {
  deleteVerificationDocument,
  fetchVerificationDocuments,
  uploadVerificationDocument,
  type VerificationDocument,
} from '../services/api'
import { fileToDataUrl } from '../utils/fileReader'
import { useReveal } from '../hooks/useReveal'

type DocStatus = 'Verified' | 'Pending' | 'Under review'

interface VerificationDoc {
  /** Stable backend key for this document slot (aadhaar, voter_id, …). */
  docType: string
  label: string
  icon: LucideIcon
  note: string
  status: DocStatus
  /** Name of the file the citizen uploaded (shown once submitted). */
  fileName?: string
}

/* The pending bank passbook + land record unlock these two catalog schemes —
   mirrors the sidebar promo copy ("Unlock 2 more scheme matches"). */
const UNLOCKED_ON_COMPLETE = ['jandhan', 'fasal'] as const

/* The six document slots. Verification status comes from the backend — a
   missing backend row simply means the citizen has not uploaded it yet. */
const DOC_META: Omit<VerificationDoc, 'status' | 'fileName'>[] = [
  { docType: 'aadhaar', label: 'Aadhaar', icon: IdCard, note: 'Upload a clear photo' },
  { docType: 'voter_id', label: 'Voter ID', icon: ScrollText, note: 'Upload a clear photo' },
  {
    docType: 'income_certificate',
    label: 'Income certificate',
    icon: FileText,
    note: 'Issued by block office',
  },
  { docType: 'ration_card', label: 'Ration card', icon: BadgeCheck, note: 'Upload front page' },
  { docType: 'bank_passbook', label: 'Bank passbook', icon: Banknote, note: 'Upload front page' },
  { docType: 'land_record', label: 'Land record (ROR)', icon: Landmark, note: 'Block office copy' },
]

/** Demo (guest) checklist mirrors the sample documents on the profile page. */
function guestDocs(): VerificationDoc[] {
  return profile.documents.map((d) => {
    const meta = DOC_META.find((m) => m.label === d.label) ?? DOC_META[0]
    return {
      docType: meta.docType,
      label: d.label,
      icon: meta.icon,
      note: d.note,
      status: d.status,
    }
  })
}

/** Real-user checklist: one row per slot, status read from the backend. A
 *  PENDING row means a file is on record but the cross-check hasn't landed
 *  yet — it stays uploadable so a stale row can simply be replaced. */
function docsFromBackend(rows: VerificationDocument[]): VerificationDoc[] {
  return DOC_META.map((meta) => {
    const row = rows.find((r) => r.docType === meta.docType)
    if (!row) return { ...meta, status: 'Pending' }
    if (row.status === 'VERIFIED') {
      return {
        ...meta,
        status: 'Verified',
        fileName: row.fileName,
        note: row.note || meta.note,
      }
    }
    return {
      ...meta,
      status: 'Under review',
      fileName: row.fileName,
      note: row.note || 'Submitted — awaiting records cross-check',
    }
  })
}

export function VerificationPage({ onOpenSchemes }: { onOpenSchemes: () => void }) {
  const { guest } = useAuth()
  const [docs, setDocs] = useState<VerificationDoc[]>(() =>
    guest ? guestDocs() : docsFromBackend([]),
  )
  const [loadingDocs, setLoadingDocs] = useState(!guest)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const timers = useRef<number[]>([])
  const scope = useReveal<HTMLDivElement>()

  /* Real users: load their verification status from the backend on mount. */
  useEffect(() => {
    if (guest) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchVerificationDocuments()
        if (!cancelled) setDocs(docsFromBackend(rows))
      } catch {
        /* Backend offline — everything stays pending; uploads will surface it. */
      } finally {
        if (!cancelled) setLoadingDocs(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [guest])

  /* Clear any pending auto-verify / toast timers on unmount. */
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const verifiedCount = docs.filter((d) => d.status === 'Verified').length
  const pendingCount = docs.filter((d) => d.status === 'Pending').length
  const reviewingCount = docs.filter((d) => d.status === 'Under review').length
  const total = docs.length
  const pct = total ? Math.round((verifiedCount / total) * 100) : 0
  const complete = total > 0 && pendingCount === 0 && reviewingCount === 0
  const unlockedSchemes = catalogSchemes.filter((s) =>
    (UNLOCKED_ON_COMPLETE as readonly string[]).includes(s.id),
  )

  const showToast = (text: string) => {
    setToast({ id: Date.now(), text })
    const t = window.setTimeout(() => setToast(null), 3400)
    timers.current.push(t)
  }

  const handleUpload = async (docType: string, file: File | undefined) => {
    if (!file) return
    const label = docs.find((d) => d.docType === docType)?.label ?? 'Document'

    if (guest) {
      /* Demo mode — simulate the whole flow locally. */
      setDocs((prev) =>
        prev.map((d) =>
          d.docType === docType
            ? { ...d, status: 'Under review', fileName: file.name }
            : d,
        ),
      )
      showToast(`${label} uploaded — verifying…`)
      const t = window.setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) =>
            d.docType === docType && d.status === 'Under review'
              ? { ...d, status: 'Verified' }
              : d,
          ),
        )
        showToast(`${label} verified ✓`)
      }, 2600)
      timers.current.push(t)
      return
    }

    /* Real user — the backend owns verification status. */
    const fileData = await fileToDataUrl(file)
    if (!fileData) {
      showToast('Could not read the file — try another photo or PDF.')
      return
    }
    const sent = await uploadVerificationDocument({ docType, fileName: file.name, fileData })
    if (!sent) {
      showToast('Upload failed — please try again.')
      return
    }
    setDocs((prev) =>
      prev.map((d) =>
        d.docType === docType
          ? { ...d, status: 'Under review', fileName: file.name }
          : d,
      ),
    )
    showToast(`${label} uploaded — verifying…`)
    /* The server runs the records cross-check (~2.5 s) — refresh to pick up
       the VERIFIED status once it lands. */
    const t = window.setTimeout(async () => {
      try {
        const rows = await fetchVerificationDocuments()
        setDocs(docsFromBackend(rows))
      } catch {
        /* keep the optimistic state */
      }
    }, 3200)
    timers.current.push(t)
  }

  const handleRemove = async (docType: string) => {
    const label = docs.find((d) => d.docType === docType)?.label ?? 'Document'
    if (guest) {
      setDocs((prev) =>
        prev.map((d) =>
          d.docType === docType
            ? { ...d, status: 'Pending', fileName: undefined }
            : d,
        ),
      )
      showToast(`${label} removed`)
      return
    }

    const ok = await deleteVerificationDocument(docType)
    if (!ok) {
      showToast('Failed to remove document — please try again.')
      return
    }

    setDocs((prev) =>
      prev.map((d) =>
        d.docType === docType
          ? { ...d, status: 'Pending', fileName: undefined }
          : d,
      ),
    )
    showToast(`${label} removed`)
  }

  return (
    <div>
      <PageHeader
        title="Document verification"
        subtitle="Verified documents unlock more scheme matches. Upload a clear photo or PDF of a pending document — the block office cross-checks it against official records."
      />

      <div
        ref={scope}
        className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3 max-md:mt-5 max-md:gap-4"
      >
        <div className="flex flex-col gap-5 lg:col-span-2">
          {!loadingDocs && (
            <div data-reveal>
              {complete ? (
                <CompleteBanner
                  unlockedSchemes={unlockedSchemes}
                  onOpenSchemes={onOpenSchemes}
                />
              ) : (
                <ProgressBanner
                  verified={verifiedCount}
                  total={total}
                  pct={pct}
                  reviewing={reviewingCount}
                  pending={pendingCount}
                />
              )}
            </div>
          )}
          <div data-reveal>
            {loadingDocs ? (
              <div className="flex items-center justify-center gap-3 rounded-[24px] border border-border-subtle bg-surface p-10 text-sm text-ink-400 shadow-soft">
                <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
                Loading your verification status…
              </div>
            ) : (
              <ChecklistCard docs={docs} onUpload={handleUpload} onRemove={handleRemove} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div data-reveal>
            <HowItWorks />
          </div>
          <div data-reveal>
            <PrivacyCard />
          </div>
        </div>
      </div>

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="toast-pop fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-full bg-brand-navy px-4 py-2.5 text-sm font-semibold text-navy-contrast shadow-lift"
        >
          <Check className="h-4 w-4 text-brand-mint" strokeWidth={2.5} />
          {toast.text}
        </div>
      )}
    </div>
  )
}

function ProgressBanner({
  verified,
  total,
  pct,
  reviewing,
  pending,
}: {
  verified: number
  total: number
  pct: number
  reviewing: number
  pending: number
}) {
  const statusText =
    reviewing > 0
      ? `${reviewing} document${reviewing > 1 ? 's' : ''} being cross-checked against official records.`
      : pending > 0
        ? `Verify your ${pending} pending document${pending > 1 ? 's' : ''} to unlock ${UNLOCKED_ON_COMPLETE.length} more scheme matches.`
        : 'All documents verified — you are fully unlocked.'

  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-navy-contrast shadow-soft md:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-orange/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-brand-mint/20 blur-3xl" />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-contrast/60">
            Verification status
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-[28px]">
            {verified} of {total} documents verified
          </h2>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-navy-contrast/70">
            {statusText}
          </p>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <span className="font-display text-xl font-bold">{pct}%</span>
        </div>
      </div>

      <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-brand-orange transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-brand-orange" />
        <p className="text-[13px] font-medium text-navy-contrast/90">
          {UNLOCKED_ON_COMPLETE.length} scheme matches unlock as soon as your
          pending documents are verified.
        </p>
      </div>
    </div>
  )
}

function CompleteBanner({
  unlockedSchemes,
  onOpenSchemes,
}: {
  unlockedSchemes: typeof catalogSchemes
  onOpenSchemes: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-mint p-6 text-[#16312a] shadow-soft md:p-7">
      <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-white/40 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <span
            data-pop
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1c6b52] shadow-soft"
          >
            <BadgeCheck className="h-6 w-6" strokeWidth={2} />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              All documents verified 🎉
            </h2>
            <p className="mt-0.5 text-sm text-[#16312a]/75">
              You unlocked {unlockedSchemes.length} new scheme matches.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSchemes}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-[#16312a] px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-[#16312a]"
        >
          View scheme matches
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16312a]/10 px-3 py-1.5 text-xs font-semibold text-[#16312a]">
          Newly unlocked
        </span>
        {unlockedSchemes.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#16312a]"
          >
            ✨ {s.title}
          </span>
        ))}
      </div>
    </div>
  )
}

function ChecklistCard({
  docs,
  onUpload,
  onRemove,
}: {
  docs: VerificationDoc[]
  onUpload: (docType: string, file: File | undefined) => void
  onRemove: (docType: string) => void
}) {
  const verifiedCount = docs.filter((d) => d.status === 'Verified').length
  /* One shared hidden input; buttons pick which document it feeds. A real
     button (not a wrapping label) keeps the action keyboard-accessible. */
  const [uploadTarget, setUploadTarget] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePick = (docType: string) => {
    setUploadTarget(docType)
    fileRef.current?.click()
  }

  return (
    <div className="rounded-[24px] border border-border-subtle bg-surface p-5 shadow-soft md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-900">
            Documents checklist
          </h3>
          <p className="mt-0.5 text-xs text-ink-400">
            Upload a clear photo or PDF of pending documents.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-mint/20 px-2.5 py-1 text-xs font-semibold text-[#3d7d6b] dark:text-[#7fd1bb]">
          {verifiedCount}/{docs.length} verified
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {docs.map((doc) => {
          const Icon = doc.icon
          return (
            <li
              key={doc.label}
              className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-canvas/40 p-4"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  doc.status === 'Verified'
                    ? 'bg-brand-mint/15 text-[#3d7d6b] dark:text-[#7fd1bb]'
                    : doc.status === 'Under review'
                      ? 'bg-brand-orange/15 text-[#b06a34] dark:text-[#f0a468]'
                      : 'bg-canvas text-ink-400'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold text-ink-900">
                    {doc.label}
                  </p>
                  <StatusChip status={doc.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-400">
                  {doc.fileName ?? doc.note}
                </p>

                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handlePick(doc.docType)}
                    disabled={doc.status === 'Under review'}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-orange/60 hover:text-ink-900 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand-orange"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {doc.status === 'Verified' ? 'Re-upload' : doc.status === 'Under review' ? 'Verifying…' : 'Upload'}
                  </button>

                  {(doc.status === 'Verified' || doc.fileName) && (
                    <button
                      type="button"
                      onClick={() => onRemove(doc.docType)}
                      disabled={doc.status === 'Under review'}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors duration-150 hover:border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-rose-500"
                      title="Remove uploaded document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Shared hidden input — fed by the per-document Upload buttons. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          if (uploadTarget) onUpload(uploadTarget, e.target.files?.[0])
          /* Reset so picking the same file again re-fires onChange. */
          e.target.value = ''
        }}
      />
    </div>
  )
}

function StatusChip({ status }: { status: DocStatus }) {
  if (status === 'Verified') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-mint/20 px-2.5 py-1 text-[11px] font-semibold text-[#3d7d6b] dark:text-[#7fd1bb]">
        <Check className="h-3 w-3" strokeWidth={3} />
        Verified
      </span>
    )
  }
  if (status === 'Under review') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-orange/15 px-2.5 py-1 text-[11px] font-semibold text-[#b06a34] dark:text-[#f0a468]">
        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.5} />
        Verifying
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-400">
      <Clock3 className="h-3 w-3" strokeWidth={2} />
      Pending
    </span>
  )
}

function HowItWorks() {
  const steps = [
    {
      title: 'Upload documents',
      text: 'Take a clear photo or upload a PDF of the pending document straight from your phone.',
    },
    {
      title: 'Records cross-check',
      text: 'The block office matches your upload against official government databases.',
    },
    {
      title: 'Matches unlocked',
      text: 'Verified documents open up more schemes for your household profile.',
    },
  ]
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <h3 className="font-display text-base font-semibold text-ink-900">
        How verification works
      </h3>
      <ol className="mt-4 flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-xs font-bold text-brand-orange">
              {i + 1}
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink-900">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function PrivacyCard() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-mint/15 text-[#3d7d6b] dark:text-[#7fd1bb]">
        <Lock className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-3 font-display text-base font-semibold text-ink-900">
        Your data stays private
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-400">
        Documents are encrypted at rest and never shown to officials in full —
        only the verification status is shared with scheme officers. Aadhaar
        numbers are masked everywhere.
      </p>
    </div>
  )
}
