import { Moon, Sun } from 'lucide-react'
import type { Theme } from '../hooks/useTheme'

export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: Theme
  onToggle: () => void
}) {
  const isDark = theme === 'dark'
  return (
    <button
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface text-ink-700 shadow-soft transition-colors duration-150 hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange md:h-9 md:w-9"

    >
      {isDark ? (
        <Sun className="h-4 w-4" strokeWidth={1.5} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.5} />
      )}
    </button>
  )
}
