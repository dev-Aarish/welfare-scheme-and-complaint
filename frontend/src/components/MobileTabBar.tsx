import {
  FileText,
  LayoutGrid,
  Map,
  MessagesSquare,
  Phone,
  Plus,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import type { TabId } from '../data'
import type { Role } from '../pages/auth/copy'
import { useNavPillSettle } from '../hooks/useNavPillSettle'

interface TabBarItem {
  id: TabId
  label: string
  icon: LucideIcon
}

/* Mobile plan §4 — 4–5 items, thumb-reachable. The helpline tab becomes the
   citizen's "Report" action; the officer keeps the map on the bar. */
const CITIZEN_TABS: TabBarItem[] = [
  { id: 'overview', label: 'Home', icon: LayoutGrid },
  { id: 'schemes', label: 'Schemes', icon: FileText },
  { id: 'complaints', label: 'Report', icon: Plus },
  { id: 'chat', label: 'Chat', icon: MessagesSquare },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

const OFFICER_TABS: TabBarItem[] = [
  { id: 'overview', label: 'Home', icon: LayoutGrid },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'schemes', label: 'Schemes', icon: FileText },
  { id: 'helpline', label: 'Help', icon: Phone },
  { id: 'chat', label: 'Chat', icon: MessagesSquare },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

interface MobileTabBarProps {
  active: TabId
  onSelect: (id: TabId) => void
  role: Role
}

export function MobileTabBar({
  active,
  onSelect,
  role,
}: MobileTabBarProps) {
  const items = role === 'officer' ? OFFICER_TABS : CITIZEN_TABS
  /* Active item settles into place on switch — same interaction language as
     the desktop sidebar (Animations.md §3.2). */
  const scope = useNavPillSettle(active)

  return (
    <nav
      ref={scope}
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="flex w-full items-stretch justify-around gap-1 px-2 pt-1.5">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-h-[52px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange"
            >
              <Icon
                size={20}
                strokeWidth={1.75}
                className={isActive ? 'text-brand-orange' : 'text-ink-400'}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-brand-orange' : 'text-ink-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
