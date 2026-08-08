import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { API_BASE_URL } from '../services/api'
import { user as demoUser, officer as demoOfficer } from '../data'
import type { Role } from '../pages/auth/copy'

/** Display identity resolved from demo (guest) or real (authenticated) state. */
export interface UserIdentity {
  name: string
  firstName: string
  initials: string
  /** Sidebar/chip subtitle: designation, role or "Citizen · verified". */
  meta: string
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

function capitalize(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Nice name for a real (non-guest) user: profile full name or the signup
    name captured in user_metadata, else the email prefix. */
function realName(profile: LocalProfile | null, user: User | null): string {
  if (profile?.fullName?.trim()) return profile.fullName.trim()
  const metaName = user?.user_metadata?.fullName
  if (typeof metaName === 'string' && metaName.trim()) return metaName.trim()
  const email = profile?.email || user?.email
  const local = email?.split('@')[0]
  if (local) return capitalize(local.replace(/[._-]+/g, ' '))
  return 'Citizen'
}

function buildIdentity(opts: {
  guest: boolean
  role: Role
  profile: LocalProfile | null
  user: User | null
}): UserIdentity {
  const { guest, role, profile, user } = opts
  if (guest) {
    if (role === 'officer') {
      return {
        name: demoOfficer.name,
        firstName: demoOfficer.name.split(' ')[0],
        initials: demoOfficer.initials,
        meta: demoOfficer.designation,
      }
    }
    return {
      name: demoUser.name,
      firstName: demoUser.name.split(' ')[0],
      initials: demoUser.initials,
      meta: 'Citizen · verified',
    }
  }
  const name = realName(profile, user)
  const isOfficer = role === 'officer'
  return {
    name,
    firstName: name.split(' ')[0],
    initials: initialsOf(name),
    meta: isOfficer ? 'Officer' : 'Citizen',
  }
}

export interface LocalProfile {
  id: string
  supabaseId?: string | null
  role: string
  email?: string | null
  fullName: string
  phone?: string | null
  state?: string
  casteCategory?: string
  annualIncome?: number
}

interface AuthContextValue {
  /** Null while the initial session restore is in flight. */
  loading: boolean
  session: Session | null
  user: User | null
  role: Role
  /** Guest = demo mode signed in without Supabase (continue-anyway). */
  guest: boolean
  profile: LocalProfile | null
  /** Display identity (name/initials/meta) resolved from demo or real state. */
  identity: UserIdentity
  sendOtp: (email: string, name?: string) => Promise<{ error?: string }>
  verifyOtp: (email: string, code: string) => Promise<{ error?: string }>
  resendOtp: (email: string) => Promise<{ error?: string }>
  officerSignIn: (identifier: string, password: string) => Promise<{ error?: string }>
  signInAsGuest: (role: Role) => void
  reloadProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function roleFromUser(user: User | null): Role {
  const meta = user?.app_metadata
  const umeta = user?.user_metadata
  if (meta?.role === 'officer' || meta?.role === 'admin') return 'officer'
  if (umeta?.role === 'officer' || umeta?.role === 'admin') return 'officer'
  return 'citizen'
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Syncs the Supabase session with the local user row via the backend. */
async function fetchLocalProfile(token: string): Promise<LocalProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    if (json.success && json.data?.user) return json.data.user
  } catch (err) {
    console.error('Failed to sync local profile:', err)
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<LocalProfile | null>(null)
  const [guest, setGuest] = useState(false)
  const [loading, setLoading] = useState(() => supabaseEnabled)

  const role: Role = roleFromUser(user)
  const identity: UserIdentity = useMemo(
    () => buildIdentity({ guest, role, profile, user }),
    [guest, role, profile, user],
  )

  /* Keep the local profile in sync whenever the Supabase session changes. */
  useEffect(() => {
    if (!supabase) return

    let alive = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return

      // A stored session may be stale (e.g. the Supabase user was deleted or
      // the token revoked) — validating drops it so the app doesn't keep
      // sending an invalid Bearer token (which just 401-spams the backend).
      let session = data.session
      if (session) {
        const { error } = await supabase.auth.getUser(session.access_token)
        if (error) {
          console.warn('Stored session is invalid, signing out:', error.message)
          await supabase.auth.signOut()
          session = null
        }
      }

      if (!alive) return
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session) {
        setProfile(await fetchLocalProfile(session.access_token))
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, next) => {
      setSession(next)
      setUser(next?.user ?? null)
      setLoading(false)
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setGuest(false)
      } else if (next?.access_token) {
        setProfile(await fetchLocalProfile(next.access_token))
      }
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const reloadProfile = useCallback(async () => {
    if (!session) return
    setProfile(await fetchLocalProfile(session.access_token))
  }, [session])

  const sendOtp = useCallback(async (email: string, name?: string) => {
    if (!supabase) return { error: 'Supabase is not configured.' }
    // Persist the display name for new-signup users so the app can greet
    // them by their chosen name rather than deriving it from the email.
    const options = name?.trim() ? { data: { fullName: name.trim() } } : undefined
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizeEmail(email),
      options,
    })
    return { error: error?.message }
  }, [])

  const resendOtp = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Supabase is not configured.' }
    const { error } = await supabase.auth.signInWithOtp({ email: normalizeEmail(email) })
    return { error: error?.message }
  }, [])

  const verifyOtp = useCallback(async (email: string, code: string) => {
    if (!supabase) return { error: 'Supabase is not configured.' }
    const emailAddr = normalizeEmail(email)
    // Try the standard OTP flow first; then the "new-user signup" flow.
    // Supabase routes brand-new (unconfirmed) emails to the Confirm Signup
    // template, so the OTP there is verified with type: 'signup'.
    for (const type of ['email', 'signup'] as const) {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailAddr,
        token: code,
        type,
      })
      if (!error) {
        setSession(data.session)
        setUser(data.session?.user ?? null)
        if (data.session) setProfile(await fetchLocalProfile(data.session.access_token))
        return {}
      }
    }
    return { error: 'Invalid or expired code.' }
  }, [])

  const officerSignIn = useCallback(async (identifier: string, password: string) => {
    if (!supabase) return { error: 'Supabase is not configured.' }
    const email = identifier.includes('@') ? identifier : `${identifier}@officer.local`
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return { error: error.message }
    // Officers are managed in the Supabase dashboard; stamp the role on the
    // user metadata so both the app and the backend know this is an officer.
    if (data.session) {
      const { error: roleError } = await supabase.auth.updateUser({
        data: { role: 'officer' },
      })
      if (roleError) console.warn('Failed to stamp officer role:', roleError.message)
    }
    setSession(data.session)
    setUser(data.session?.user ?? null)
    if (data.session) setProfile(await fetchLocalProfile(data.session.access_token))
    return {}
  }, [])

  /* Demo escape hatch — works with or without Supabase configured. */
  const signInAsGuest = useCallback((r: Role) => {
    setGuest(true)
    setUser(null)
    setSession(null)
    setProfile(null)
    if (r === 'officer') {
      setProfile({ id: 'guest-officer', role: 'officer', fullName: 'Demo Officer' })
    }
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
    setGuest(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user,
      role,
      guest,
      profile,
      identity,
      sendOtp,
      verifyOtp,
      resendOtp,
      officerSignIn,
      signInAsGuest,
      reloadProfile,
      signOut,
    }),
    [loading, session, user, role, guest, profile, identity, sendOtp, verifyOtp, resendOtp, officerSignIn, signInAsGuest, reloadProfile, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.')
  return ctx
}