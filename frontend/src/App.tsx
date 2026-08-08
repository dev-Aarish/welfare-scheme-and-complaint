import { useEffect, useState } from 'react'
import { DecorativeBackground } from './components/DecorativeBackground'
import { AuthPage } from './pages/auth/AuthPage'
import type { Role } from './pages/auth/copy'
import { OfficerPage } from './pages/officer/OfficerPage'
import { OfficerMapPage } from './pages/officer/OfficerMapPage'
import { OfficerProfilePage } from './pages/officer/OfficerProfilePage'
import { OfficerHelplinePage } from './pages/officer/OfficerHelplinePage'
import { Sidebar } from './components/Sidebar'
import { MobileHeader } from './components/MobileHeader'
import { MobileTabBar } from './components/MobileTabBar'
import { Hero } from './components/Hero'
import { SchemesSection } from './components/SchemesSection'
import { ResolvedSection } from './components/ResolvedSection'
import { Footer } from './components/Footer'
import { ChatPage } from './pages/ChatPage'
import { ProfilePage } from './pages/ProfilePage'
import { CatalogPage } from './pages/CatalogPage'
import { SchemeDetailPage } from './pages/SchemeDetailPage'
import { HelplinePage } from './pages/HelplinePage'
import { useTheme } from './hooks/useTheme'
import type { TabId } from './data'

const AUTH_KEY = 'sevanest-auth'

/** Persists which role is signed in (UI-only mock): returns the stored role,
 *  or null when nobody is signed in. */
function readAuthRole(): Role | null {
  try {
    const v = localStorage.getItem(AUTH_KEY)
    return v === 'citizen' || v === 'officer' ? v : null
  } catch {
    return null
  }
}

export default function App() {
  const [tab, setTab] = useState<TabId>('overview')
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null)
  const { theme, toggle } = useTheme()
  /* UI-only mock gate: the AuthPage signs the demo session in/out locally. */
  const [authed, setAuthed] = useState<boolean>(() => readAuthRole() !== null)
  const [role, setRole] = useState<Role>(() => readAuthRole() ?? 'citizen')

  const handleTabSelect = (newTab: TabId) => {
    setSelectedSchemeId(null)
    setTab(newTab)
  }

  const signIn = (r: Role) => {
    try {
      localStorage.setItem(AUTH_KEY, r)
    } catch {
      /* storage unavailable — session still signs in */
    }
    setRole(r)
    setAuthed(true)
  }

  const signOut = () => {
    try {
      localStorage.removeItem(AUTH_KEY)
    } catch {
      /* ignore */
    }
    setRole('citizen')
    setAuthed(false)
    setTab('overview')
    setSelectedSchemeId(null)
  }

  /* Theme crossfade (Animations.md §4 Phase 2): let colors ease for ~300ms
     while the `dark` class flips, then remove the transitional class. */
  const toggleTheme = () => {
    const root = document.documentElement
    root.classList.add('theme-fade-active')
    window.setTimeout(
      () => root.classList.remove('theme-fade-active'),
      350,
    )
    toggle()
  }

  /* Tab switches on touch devices land at the top of the new page — desktop
     (fine-pointer) behaviour is untouched. */
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      window.scrollTo({ top: 0 })
    }
  }, [tab, selectedSchemeId])

  if (!authed) {
    return (
      <div className="min-h-screen bg-canvas font-sans text-ink-900">
        <DecorativeBackground insetForSidebar={false} />
        <AuthPage theme={theme} onToggleTheme={toggleTheme} onSignIn={signIn} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink-900">
      <DecorativeBackground />

      <MobileHeader theme={theme} onToggleTheme={toggleTheme} role={role} />
      <Sidebar
        active={tab}
        onSelect={handleTabSelect}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={signOut}
        role={role}
      />
      <MobileTabBar active={tab} onSelect={handleTabSelect} role={role} />

      <div className="relative z-10 lg:pl-[264px]">
        {/* key={tab} re-mounts the content per tab so the page-enter
            transition plays on every switch (Animations.md §3.2) */}
        <main
          key={`${tab}-${selectedSchemeId || 'list'}`}
          className="page-enter mx-auto w-full max-w-[1536px] px-4 py-8 md:px-6 lg:px-8 lg:py-10 max-md:px-4 max-md:pb-28"
        >
          {tab === 'overview' &&
            /* Officers get their own desk view; the other tabs stay shared
               for now — a glimpse, not a full staff workspace. */
            (role === 'officer' ? (
              <OfficerPage />
            ) : (
              <>
                <Hero onReport={() => handleTabSelect('helpline')} />
                <SchemesSection
                  onOpenCatalog={() => handleTabSelect('schemes')}
                  onSelectScheme={(id) => {
                    setSelectedSchemeId(id)
                    setTab('schemes')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
                <ResolvedSection />
              </>
            ))}
          {tab === 'map' && role === 'officer' && <OfficerMapPage />}
          {tab === 'chat' && <ChatPage role={role} />}
          {tab === 'profile' &&
            (role === 'officer' ? <OfficerProfilePage /> : <ProfilePage />)}
          {tab === 'schemes' &&
            (selectedSchemeId ? (
              <SchemeDetailPage
                schemeId={selectedSchemeId}
                onBack={() => setSelectedSchemeId(null)}
              />
            ) : (
              <CatalogPage
                role={role}
                onSelectScheme={(id) => {
                  setSelectedSchemeId(id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            ))}
          {tab === 'helpline' &&
            (role === 'officer' ? (
              <OfficerHelplinePage />
            ) : (
              <HelplinePage />
            ))}
          <Footer onSignOut={signOut} />
        </main>
      </div>
    </div>
  )
}
