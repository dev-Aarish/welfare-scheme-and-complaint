import { useEffect, useState } from 'react'
import { DecorativeBackground } from './components/DecorativeBackground'
import { AuthPage } from './pages/auth/AuthPage'
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
import { VerificationPage } from './pages/VerificationPage'
import { CatalogPage } from './pages/CatalogPage'
import { SchemeDetailPage } from './pages/SchemeDetailPage'
import { HelplinePage } from './pages/HelplinePage'
import { FileComplaintPage } from './pages/FileComplaintPage'
import { AnonymousComplaintPage } from './pages/AnonymousComplaintPage'
import { ComplaintTrackingPage } from './pages/ComplaintTrackingPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage'
import { AdminComplaintDetailPage } from './pages/admin/AdminComplaintDetailPage'
import { getAdminToken, clearAdminAuth } from './api/adminApi'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useTheme } from './hooks/useTheme'
import { useMyComplaints } from './hooks/useMyComplaints'
import type { TabId } from './data'

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

function AppShell() {
  /* Route path state for /admin pathname handling */
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname)

  const [tab, setTabState] = useState<TabId>(() => {
    const path = window.location.pathname
    if (path === '/file-complaint') return 'complaints'
    if (path.startsWith('/complaints/track')) return 'track'
    try {
      const saved = localStorage.getItem('sevanest-active-tab') as TabId
      const valid: TabId[] = ['overview', 'map', 'chat', 'profile', 'schemes', 'helpline', 'complaints', 'track', 'verification']
      if (saved && valid.includes(saved)) return saved
    } catch {}
    return 'overview'
  })

  const setTab = (newTab: TabId) => {
    setTabState(newTab)
    try {
      localStorage.setItem('sevanest-active-tab', newTab)
    } catch {}
  }

  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null)
  /* Real count arrives from the backend AI matcher (SchemesSection reports
     it via onMatchesChange). Starts as null = "not known yet" so the hero
     shows a neutral placeholder instead of a misleading 0 or a fake number. */
  const [schemesMatched, setSchemesMatched] = useState<number | null>(null)
  const { theme, toggle } = useTheme()
  /* Supabase session when configured; guest role when demo mode. */
  const { loading, session, role, guest, signOut } = useAuth()
  const authed = guest || session !== null

  /* Real complaint records for the citizen overview — demo data in guest
     mode, the signed-in user's own reports from the backend otherwise. */
  const {
    complaints: overviewComplaints,
    details: overviewComplaintDetails,
    avgResolution,
    loading: complaintsLoading,
  } = useMyComplaints(
    !currentPath.startsWith('/admin') && tab === 'overview' && role !== 'officer',
  )

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (path: string) => {
    window.history.pushState(null, '', path)
    setCurrentPath(path)
  }

  const handleTabSelect = (newTab: TabId) => {
    setSelectedSchemeId(null)
    setTab(newTab)
  }

  const handleSignOut = () => {
    signOut()
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

  /* ── ADMIN ROUTE HANDLING ─────────────── */
  if (currentPath.startsWith('/admin')) {
    const hasAdminToken = Boolean(getAdminToken())

    const handleAdminLogout = () => {
      clearAdminAuth()
      navigate('/admin/login')
    }

    if (currentPath === '/admin/login') {
      if (hasAdminToken) {
        // If already authenticated as admin, go straight to dashboard
        return (
          <AdminDashboardPage
            theme={theme}
            onToggleTheme={toggleTheme}
            onNavigate={navigate}
            onLogout={handleAdminLogout}
          />
        )
      }
      return (
        <AdminLoginPage
          theme={theme}
          onToggleTheme={toggleTheme}
          onSuccess={() => navigate('/admin/dashboard')}
        />
      )
    }

    // Protected Routes: /admin/dashboard, /admin/complaints, /admin/complaints/:id
    if (!hasAdminToken) {
      return (
        <AdminLoginPage
          theme={theme}
          onToggleTheme={toggleTheme}
          onSuccess={() => navigate(currentPath.startsWith('/admin/complaints') ? currentPath : '/admin/dashboard')}
        />
      )
    }

    if (currentPath === '/admin/complaints') {
      return (
        <AdminComplaintsPage
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigate={navigate}
          onLogout={handleAdminLogout}
        />
      )
    }

    if (currentPath.startsWith('/admin/complaints/')) {
      const complaintId = currentPath.replace('/admin/complaints/', '')
      return (
        <AdminComplaintDetailPage
          complaintId={complaintId}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigate={navigate}
          onLogout={handleAdminLogout}
        />
      )
    }

    return (
      <AdminDashboardPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        onLogout={handleAdminLogout}
      />
    )
  }

  /* ── CITIZEN & OFFICER ROUTE HANDLING ─────────────────────────── */
  if (currentPath.startsWith('/complaints/track')) {
    const queryParams = new URLSearchParams(window.location.search);
    const refParam = queryParams.get('ref') || undefined;
    return (
      <ComplaintTrackingPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        initialRef={refParam}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas font-sans text-ink-900">
        <p className="text-sm text-ink-400">Loading…</p>
      </div>
    )
  }

 if (!authed) {
  /* Public anonymous complaint page — reachable without an account. */
  if (currentPath === '/file-complaint') {
    return (
      <AnonymousComplaintPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onBack={() => navigate('/')}
      />
    )
  }

  /* Signed-out visitors land straight on the login / sign-up page. */
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink-900">
      <DecorativeBackground insetForSidebar={false} />
      <AuthPage
        theme={theme}
        onToggleTheme={toggleTheme}
      />
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
        onSignOut={handleSignOut}
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
                <Hero
                  onReport={() => handleTabSelect('helpline')}
                  schemesMatched={schemesMatched}
                  complaints={overviewComplaints}
                  avgResolution={avgResolution}
                  loading={complaintsLoading}
                />
                <SchemesSection
                  onOpenCatalog={() => handleTabSelect('schemes')}
                  onSelectScheme={(id) => {
                    setSelectedSchemeId(id)
                    setTab('schemes')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  onMatchesChange={setSchemesMatched}
                />
                <ResolvedSection
                  complaints={overviewComplaints}
                  details={overviewComplaintDetails}
                  loading={complaintsLoading}
                />
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
          {tab === 'complaints' && role !== 'officer' && (
            <FileComplaintPage
              onNavigate={(path) => {
                if (path.startsWith('/complaints/track')) {
                  window.history.pushState(null, '', path);
                  window.dispatchEvent(new Event('popstate'));
                  setTab('track');
                }
              }}
            />
          )}
          {tab === 'track' && (
            <ComplaintTrackingPage
              theme={theme}
              onToggleTheme={toggle}
              onNavigate={(path) => {
                window.history.pushState(null, '', path);
                window.dispatchEvent(new Event('popstate'));
                if (path === '/') setTab('overview');
                else if (path === '/file-complaint') setTab('complaints');
              }}
            />
          )}
          {tab === 'verification' && role !== 'officer' && (
            <VerificationPage onOpenSchemes={() => handleTabSelect('schemes')} />
          )}
          <Footer onSignOut={handleSignOut} />
        </main>
      </div>
    </div>
  )
}
