import type { Role } from '../pages/auth/copy'
import { useAuth } from '../context/AuthContext'

interface MobileHeaderProps {
  role: Role
}

/* Mobile plan §4: the top bar is minimal — location + greeting left, one or
   two utility icons right. No logo wordmark on repeat visits (it lives on
   the auth screen only); the bottom tab bar replaces the old pill row. */
export function MobileHeader({ role }: MobileHeaderProps) {
  const isOfficer = role === 'officer'
  const { identity } = useAuth()
  const firstName = identity.firstName

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-canvas/85 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-ink-400">
            {isOfficer ? 'Uluberia-I Block Office' : 'Uluberia-I block'}
          </p>
          <h1 className="mt-0.5 truncate font-display text-xl font-bold leading-snug text-ink-900">
            {isOfficer ? `Good morning, Officer ${firstName}` : `Hi, ${firstName}`}
          </h1>
        </div>

      </div>
    </header>
  )
}
