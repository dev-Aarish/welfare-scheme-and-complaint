import { ArrowLeft } from 'lucide-react'
import { DecorativeBackground } from '../components/DecorativeBackground'
import { Logo } from '../components/Logo'
import { FileComplaintPage } from './FileComplaintPage'

interface AnonymousComplaintPageProps {
  onBack: () => void
}

/* Public page for signed-out visitors: same form as the citizen flow, but
   filed with no account attached — identity stays anonymous. */
export function AnonymousComplaintPage({ onBack }: AnonymousComplaintPageProps) {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink-900">
      <DecorativeBackground insetForSidebar={false} />

      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/85 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-4 md:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-soft transition-colors hover:border-brand-orange hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <Logo />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-8 md:px-6 md:py-10 max-md:px-4">
        <FileComplaintPage anonymous />
      </main>
    </div>
  )
}
