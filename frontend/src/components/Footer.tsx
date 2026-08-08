import { LogOut, ShieldCheck } from 'lucide-react'

export function Footer({ onSignOut }: { onSignOut?: () => void }) {
  return (
    <footer className="mt-12 border-t border-border-subtle pb-4 pt-6 text-center max-md:mt-8 max-md:pt-5">
      {onSignOut && (
        <button
          onClick={onSignOut}
          className="mx-auto mb-5 flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-5 py-2.5 text-[13px] font-medium text-ink-400 transition-colors duration-150 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange lg:hidden"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign out (demo)
        </button>
      )}
      <p className="text-sm font-medium text-ink-700 max-md:text-[13px]">
        SevaNest — Community Platform for Welfare-Scheme Access &amp;
        Transparent Grievance Redressal
      </p>
      <p className="mt-1 text-xs text-ink-400 max-md:text-[11px]">
        IEMH4-SI-01 · Eligibility matching · Multilingual voice assistant ·
        Anonymous geotagged reporting
      </p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            window.history.pushState(null, '', '/admin/login')
            window.dispatchEvent(new Event('popstate'))
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700 transition-colors hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-brand-orange" />
          <span>Admin Login</span>
        </button>
      </div>
    </footer>
  )
}
