import { ChevronDown, ChevronRight, LogOut } from 'lucide-react'
import { tabs, user, officer, type Tab, type TabId } from '../data'
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
  const identity = role === 'officer' ? officer : user
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

      {/* User chip */}
      <div className="mt-7 flex items-center gap-3 rounded-2xl border border-border-subtle px-3 py-2.5">
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
            {role === 'officer' ? officer.designation : 'Citizen · verified'}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-400" />
      </div>

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

      <div className="mt-auto flex flex-col gap-4">
        <PromoCard />
        <button
          onClick={onSignOut}
          title="Sign out (demo)"
          className="flex w-full items-center gap-2.5 rounded-[14px] px-4 py-2.5 text-left text-[13px] font-medium text-ink-400 transition-colors duration-150 hover:bg-canvas hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange"
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

function PromoCard() {
  return (
    <button className="group relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 text-left shadow-soft transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-orange">
      <ChevronRight className="absolute right-3 top-3 h-4 w-4 text-ink-400 transition-transform duration-150 group-hover:translate-x-0.5" />
      <p className="pr-6 text-sm font-semibold leading-snug text-ink-900">
        Let's verify your documents
      </p>
      <p className="mt-1 pr-10 text-xs leading-relaxed text-ink-400">
        Unlock 2 more scheme matches.
      </p>
      <MeditatingFigure className="absolute -bottom-2 -right-2 h-16 w-16 text-brand-orange" />
    </button>
  )
}

function MeditatingFigure({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="32" cy="14" r="6" />
      <path d="M32 22v10" />
      <path d="M20 48c0-9 5-13 12-13s12 4 12 13" />
      <path d="M13 48h38" />
      <path d="M24 37l-7 7 4 4" />
      <path d="M40 37l7 7-4 4" />
    </svg>
  )
}
