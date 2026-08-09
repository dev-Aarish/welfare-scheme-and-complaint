import { ChevronDown, ChevronRight, LogOut, ShieldCheck } from 'lucide-react'
import { tabs, type Tab, type TabId } from '../data'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../pages/auth/copy'
import type { Theme } from '../hooks/useTheme'
import { useNavPillSettle } from '../hooks/useNavPillSettle'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

interface SidebarProps {
  active: TabId
  onSelect: (id: TabId) => void
  theme: Theme
  onToggleTheme: () => void
  onSignOut: () => void
  role: Role
}

export function Sidebar({
  active,
  onSelect,
  theme,
  onToggleTheme,
  onSignOut,
  role,
}: SidebarProps) {
  const { identity } = useAuth()
  const visibleTabs = tabs.filter((t) => role === 'officer' || !t.officerOnly)
  /* Nav pill settles softly into its new position on tab switch (§3.2). */
  const scope = useNavPillSettle(active)

  return (
    <aside
      ref={scope}
      className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-border-subtle bg-surface px-5 py-6 lg:flex"
    >
      <div className="flex items-center justify-between">
        <Logo />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* User chip — opens the My profile tab */}
      <button
        type="button"
        onClick={() => onSelect('profile')}
        title="My profile"
        aria-current={active === 'profile' ? 'page' : undefined}
        className="group mt-7 flex w-full items-center gap-3 rounded-2xl border border-border-subtle px-3 py-2.5 text-left transition-colors duration-150 hover:border-brand-orange/40 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand-orange"
      >
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-[#c97a45] text-[13px] font-semibold text-white">
            {identity.initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-brand-mint" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-ink-900">
            {identity.name}
          </p>
          <p className="truncate text-xs text-ink-400">
            {identity.meta}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-150 group-hover:-translate-y-0.5 ${
            active === 'profile' ? 'rotate-180' : ''
          }`}
        />
      </button>

      <nav className="mt-7 flex flex-col gap-1.5" aria-label="Primary">
        {visibleTabs.map((tab) => (
          <NavItem
            key={tab.id}
            tab={tab}
            active={active === tab.id}
            onClick={() => onSelect(tab.id)}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        {role !== 'officer' && (
          <PromoCard onClick={() => onSelect('verification')} />
        )}
        <button
          type="button"
          onClick={() => {
            window.history.pushState(null, '', '/complaints/track')
            window.dispatchEvent(new Event('popstate'))
          }}
          title="Track Grievance (Step-by-Step)"
          className="flex w-full items-center gap-2.5 rounded-[14px] px-4 py-2 text-left text-[13px] font-semibold text-ink-700 transition-colors duration-150 hover:bg-canvas hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand-orange" strokeWidth={1.75} />
          Live Grievance Tracker
        </button>
        <button
          type="button"
          onClick={() => {
            window.history.pushState(null, '', '/admin/login')
            window.dispatchEvent(new Event('popstate'))
          }}
          title="Admin Login Portal"
          className="flex w-full items-center gap-2.5 rounded-[14px] px-4 py-2 text-left text-[13px] font-semibold text-ink-700 transition-colors duration-150 hover:bg-canvas hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand-orange" strokeWidth={1.75} />
          Admin Portal
        </button>
        <button
          onClick={onSignOut}
          title="Sign out (demo)"
          className="flex w-full items-center gap-2.5 rounded-[14px] px-4 py-2 text-left text-[13px] font-medium text-ink-400 transition-colors duration-150 hover:bg-canvas hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function NavItem({
  tab,
  active,
  onClick,
}: {
  tab: Tab
  active: boolean
  onClick: () => void
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-[14px] px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange ${
        active
          ? 'bg-brand-navy text-navy-contrast shadow-soft'
          : 'text-ink-400 hover:bg-canvas hover:text-ink-900'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
      <span className="text-[15px] font-medium">{tab.label}</span>
    </button>
  )
}

function PromoCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Verify documents to unlock more matches"
      className="group relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 text-left shadow-soft transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-orange"
    >
      <ChevronRight className="absolute right-3 top-3 h-4 w-4 text-ink-400 transition-transform duration-150 group-hover:translate-x-0.5" />
      <p className="pr-6 text-sm font-semibold leading-snug text-ink-900">
        Let's verify your documents
      </p>
      <p className="mt-1 pr-6 text-xs leading-relaxed text-ink-400">
        Unlock 2 more scheme matches.
      </p>
    </button>
  )
}
