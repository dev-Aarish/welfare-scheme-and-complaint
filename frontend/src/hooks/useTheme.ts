import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'sevanest-theme'

function getInitialTheme(): Theme {
  /* Theme toggles have been removed — SevaNest is permanently light mode.
     Dark-mode support stays intact in this hook and the stylesheets; only
     the default is pinned here, so it can be re-enabled in one line. */
  return 'light'
}

/**
 * Theme state synced to the `dark` class on <html> and persisted to
 * localStorage. Defaults to light (see the inline pre-paint script in
 * index.html to avoid a flash of the wrong theme).
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle }
}
