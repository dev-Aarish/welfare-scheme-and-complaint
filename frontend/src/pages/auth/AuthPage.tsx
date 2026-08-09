import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Languages,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Logo } from '../../components/Logo'
import { ThemeToggle } from '../../components/ThemeToggle'
import type { Theme } from '../../hooks/useTheme'
import { useAuth } from '../../context/AuthContext'
import { gsap, useGSAP, pressChip } from '../../lib/animations'
import { copy, LANGS, type Lang, type Mode, type Role } from './copy'

interface AuthPageProps {
  theme: Theme
  onToggleTheme: () => void
}

const OTP_MIN = 6
const OTP_MAX = 8

/* Shared field shell (design.md §5: 14px radius, canvas fill, orange focus ring) */
function Field({
  icon,
  children,
  className = '',
}: {
  icon: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-border-subtle bg-canvas/60 px-4 py-3.5 transition-colors duration-150 focus-within:border-brand-orange focus-within:ring-[3px] focus-within:ring-brand-orange/15 ${className}`}
    >
      <span className="shrink-0 text-ink-400">{icon}</span>
      {children}
    </div>
  )
}

const fieldInput =
  'w-full min-w-0 bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400'

function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="mt-3 rounded-xl bg-brand-orange/10 px-3 py-2 text-[13px] font-medium text-[#b06a34] dark:text-[#f0a468]"
    >
      {message}
    </p>
  )
}

const primaryBtn =
  'flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-navy-contrast shadow-soft transition-colors duration-150 hover:bg-[#2d2839] focus-visible:outline-2 focus-visible:outline-brand-orange dark:hover:bg-[#d9d5cd]'

const orangeLink =
  'text-[13px] font-semibold text-[#b06a34] transition-colors duration-150 hover:text-ink-900 dark:text-[#f0a468]'

export function AuthPage({ theme, onToggleTheme }: AuthPageProps) {
  const { sendOtp, verifyOtp, resendOtp, officerSignIn, signInAsGuest } = useAuth()
  /* English by default; the audience can switch to Bengali or Hindi. */
  const [lang, setLang] = useState<Lang>('en')
  const [role, setRole] = useState<Role>('citizen')
  const [mode, setMode] = useState<Mode>('signin')
  const [step, setStep] = useState<'form' | 'otp'>('form')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(() => Array(OTP_MAX).fill(''))
  const [officerId, setOfficerId] = useState('')
  const [officerPw, setOfficerPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(30)
  const [busy, setBusy] = useState(false)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const scope = useRef<HTMLDivElement>(null)

  const t = copy[lang]
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  /* ── Signature entrance (Animations.md §3.1 pattern): card → brand column
     → form column, staggered. Reduced motion renders statically. ───────── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {})
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
        tl.from('[data-auth="card"]', { y: 26, opacity: 0, duration: 0.6 })
          .from(
            '[data-auth="brand"] > *',
            { y: 14, opacity: 0, duration: 0.5, stagger: 0.07 },
            '-=0.35',
          )
          .from(
            '[data-auth="formcol"] > *',
            { y: 12, opacity: 0, duration: 0.45, stagger: 0.05 },
            '-=0.45',
          )
      })
    },
    { scope },
  )

  /* Resend countdown runs only while we're on the OTP step. */
  useEffect(() => {
    if (step !== 'otp' || resendIn <= 0) return
    const id = window.setInterval(
      () => setResendIn((s) => (s > 0 ? s - 1 : 0)),
      1000,
    )
    return () => window.clearInterval(id)
  }, [step, resendIn])

  /* Focus the first OTP box the moment the step opens. */
  useEffect(() => {
    if (step === 'otp') otpRefs.current[0]?.focus()
  }, [step])

  const selectRole = (r: Role) => {
    setRole(r)
    setStep('form')
    setMode('signin')
    setOtp(Array(OTP_MAX).fill(''))
    setError(null)
  }

  const selectLang = (l: Lang) => {
    setLang(l)
    setError(null)
  }

  const submitEmail = async () => {
    if (!emailPattern.test(email.trim())) {
      setError(t.errMobile)
      return
    }
    setError(null)
    setBusy(true)
    const { error: sendError } = await sendOtp(email, name.trim() || undefined)
    setBusy(false)
    if (sendError) {
      setError(sendError)
      return
    }
    setOtp(Array(OTP_MAX).fill(''))
    setStep('otp')
    setResendIn(30)
  }

  const submitVerification = async (code: string) => {
    if (busy) return
    setError(null)
    setBusy(true)
    const { error: verifyError } = await verifyOtp(email, code)
    setBusy(false)
    if (verifyError) setError(verifyError)
  }

  const handleOtpChange = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    const next = [...otp]
    if (digits.length > 1) {
      /* Paste a whole code: distribute across the boxes from here on. */
      for (let k = 0; k < digits.length && i + k < OTP_MAX; k++) {
        next[i + k] = digits[k]
      }
    } else {
      next[i] = digits.slice(-1)
    }
    setOtp(next)
    setError(null)

    /* Once a full code is typed (6–8 digits) → verify against Supabase.
       Only auto-verify when all boxes are filled (no trailing empties). */
    if (next.every(Boolean)) {
      window.setTimeout(() => submitVerification(next.join('')), 180)
      return
    }

    const focusIdx =
      digits.length > 1 ? Math.min(i + digits.length, OTP_MAX - 1) : i + 1
    if (digits.length > 0 && focusIdx < OTP_MAX) {
      otpRefs.current[focusIdx]?.focus()
    }
  }

  const handleOtpKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const submitOtp = () => {
    const code = otp.join('') // trailing empty boxes contribute no characters
    if (code.length < OTP_MIN) {
      setError(t.errOtp)
      return
    }
    submitVerification(code)
  }

  const resend = async () => {
    setBusy(true)
    const { error: sendError } = await resendOtp(email)
    setBusy(false)
    if (sendError) {
      setError(sendError)
      return
    }
    setOtp(Array(OTP_MAX).fill(''))
    setResendIn(30)
    otpRefs.current[0]?.focus()
  }

  const submitOfficer = async () => {
    if (!officerId.trim() || !officerPw) {
      setError(t.errLogin)
      return
    }
    setError(null)
    setBusy(true)
    const { error: signInError } = await officerSignIn(officerId.trim(), officerPw)
    setBusy(false)
    if (signInError) setError(signInError)
  }

  const onFormSubmit = (e: FormEvent) => e.preventDefault()

  return (
    <div
      ref={scope}
      className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8"
    >
      {/* Page-background doodles (concentric spiral, squiggles) are provided
          by DecorativeBackground in App.tsx — do not duplicate them here. */}

      <div className="absolute right-6 top-6 z-20 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            window.history.pushState(null, '', '/admin/login')
            window.dispatchEvent(new Event('popstate'))
          }}
          className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface/80 px-3.5 py-2 text-[13px] font-semibold text-ink-700 backdrop-blur-sm transition-all duration-150 hover:border-brand-orange hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange shadow-soft"
          title="Go to Admin Login"
        >
          <ShieldCheck className="h-4 w-4 text-brand-orange" />
          <span>Admin Login</span>
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="w-full max-w-[1000px]">
        <div
          data-auth="card"
          className="grid overflow-hidden rounded-[28px] border border-border-subtle bg-surface shadow-lift lg:grid-cols-[5fr_6fr] max-md:rounded-[20px]"
        >
          {/* ── Brand panel (sage → white hero band, design.md §2) ─────── */}
          <aside
            data-auth="brand"
            className="hero-band relative flex flex-col justify-between gap-8 overflow-hidden px-7 py-8 md:px-10 lg:py-10 max-md:gap-6 max-md:px-5 max-md:py-6"
          >
            <div className="flex items-center justify-between gap-3">
              <Logo />
              <span className="shrink-0 rounded-full bg-surface/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700 backdrop-blur-sm">
                {t.brandEyebrow}
              </span>
            </div>

            <div>
              <h1 className="font-display text-[28px] font-semibold leading-[1.2] text-ink-900 sm:text-4xl max-md:text-[22px]">
                {t.brandTitle}
              </h1>
              <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink-700">
                {t.brandSub}
              </p>

              {/* Trust list — the reassurance this audience needs before typing */}
              <ul className="mt-6 hidden flex-col gap-2.5 lg:flex">
                {t.trust.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-700"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-mint/25 text-[#3d7d6b] dark:text-[#7fd1bb]">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* "Inside your portal" preview — GuideCard spiral/line motif */}
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-border-subtle bg-surface/85 p-5 shadow-soft backdrop-blur-sm">
                <p className="font-display text-[15px] font-semibold text-ink-900">
                  {t.insideTitle}
                </p>
                <p className="mt-0.5 text-xs text-ink-400">{t.insideHint}</p>

                <div className="relative mt-4 flex items-center">
                  <svg
                    viewBox="0 0 48 12"
                    className="h-3 w-14 shrink-0 text-brand-orange"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M2 6 C 10 0, 18 12, 26 6 S 40 0, 46 6" />
                  </svg>
                  <div className="h-px flex-1 bg-ink-900/10" />
                  <span className="absolute left-[40%] h-2.5 w-2.5 rounded-full bg-brand-orange" />
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2">
                  {t.stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl bg-canvas/60 px-2 py-2.5 text-center"
                    >
                      <dd className="font-display text-base font-semibold text-ink-900">
                        {s.value}
                      </dd>
                      <dt className="mt-0.5 text-[10px] leading-tight text-ink-400">
                        {s.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Small squiggle flourish bleeding off the panel corner */}
            <svg
              viewBox="0 0 160 80"
              className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-36 text-brand-mint opacity-20 dark:opacity-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M5 40 C 30 15, 55 65, 80 40 S 130 15, 155 40" />
            </svg>
          </aside>

          {/* ── Form panel ─────────────────────────────────────────────── */}
          <section
            data-auth="formcol"
            className="flex flex-col justify-center px-7 py-8 md:px-10 lg:py-10 max-md:px-5 max-md:py-6"
          >
            <div className="mx-auto w-full max-w-[420px]">
              {/* Role switcher — Citizen default, Officer for staff */}
              <div className="flex gap-1.5 rounded-2xl bg-canvas p-1.5" aria-label="Role">
                {(['citizen', 'officer'] as Role[]).map((r) => {
                  const Icon = r === 'citizen' ? UserRound : ShieldCheck
                  const active = role === r
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectRole(r)}
                      onPointerDown={(e) => pressChip(e.currentTarget)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange ${
                        active
                          ? 'bg-brand-navy text-navy-contrast shadow-soft'
                          : 'text-ink-400 hover:text-ink-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      {r === 'citizen' ? t.roleCitizen : t.roleOfficer}
                    </button>
                  )
                })}
              </div>

              {/* Language chips — the first decision on this page */}
              <div className="mt-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  <Languages className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {t.langLabel}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {LANGS.map(({ id, native }) => {
                    const active = lang === id
                    return (
                      <button
                        key={id}
                        onClick={() => selectLang(id)}
                        onPointerDown={(e) => pressChip(e.currentTarget)}
                        aria-pressed={active}
                        className={`rounded-xl border px-2 py-2 text-[13px] font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange ${
                          active
                            ? 'border-brand-navy bg-brand-navy text-navy-contrast shadow-soft'
                            : 'border-border-subtle bg-surface text-ink-700 hover:border-brand-orange hover:text-ink-900'
                        }`}
                      >
                        {native}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Form — re-mounts per role/step/mode so the step transition plays */}
              <div key={`${role}-${step}-${mode}`} className="step-enter mt-6">
                {role === 'citizen' ? (
                  step === 'form' ? (
                    <form onSubmit={onFormSubmit} noValidate>
                      <h2 className="font-display text-2xl font-semibold text-ink-900">
                        {mode === 'signin'
                          ? t.citizenHeading.signin
                          : t.citizenHeading.signup}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-ink-700">
                        {mode === 'signin' ? t.citizenSub.signin : t.citizenSub.signup}
                      </p>

                      {mode === 'signup' && (
                        <Field icon={<UserRound className="h-[17px] w-[17px]" strokeWidth={1.5} />} className="mt-5">
                          <label className="sr-only" htmlFor="auth-name">
                            {t.nameLabel}
                          </label>
                          <input
                            id="auth-name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.namePlaceholder}
                            className={fieldInput}
                          />
                        </Field>
                      )}

                      <Field
                        icon={<Mail className="h-[17px] w-[17px]" strokeWidth={1.5} />}
                        className={mode === 'signup' ? 'mt-3' : 'mt-5'}
                      >
                        <label className="sr-only" htmlFor="auth-email">
                          {t.emailLabel}
                        </label>
                        <input
                          id="auth-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            setError(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitEmail()
                          }}
                          placeholder={t.emailPlaceholder}
                          className={fieldInput}
                        />
                      </Field>
                      <p className="mt-2 text-xs text-ink-400">{t.emailHelper}</p>

                      <FormError message={error} />

                      <button
                        type="button"
                        onClick={submitEmail}
                        disabled={busy}
                        className={`${primaryBtn} mt-5 disabled:opacity-45`}
                      >
                        {t.sendCode}
                        <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </form>
                  ) : (
                    /* OTP step */
                    <div>
                      <button
                        type="button"
                        onClick={() => setStep('form')}
                        className="flex items-center gap-1.5 text-[13px] font-medium text-ink-400 transition-colors duration-150 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {t.back}
                      </button>

                      <h2 className="mt-3 font-display text-2xl font-semibold text-ink-900">
                        {t.otpHeading}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-ink-700">
                        {t.otpSub}{' '}
                        <span className="font-semibold text-ink-900">{email}</span>{' '}
                        <button
                          type="button"
                          onClick={() => setStep('form')}
                          className={orangeLink}
                        >
                          {t.changeNumber}
                        </button>
                      </p>

                      <div className="mt-5 flex gap-2" role="group" aria-label="OTP">
                        {otp.map((d, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              otpRefs.current[i] = el
                            }}
                            value={d}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKey(i, e)}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            aria-label={`Digit ${i + 1}`}
                            className="h-14 w-full min-w-0 rounded-2xl border border-border-subtle bg-canvas/60 text-center font-display text-xl font-semibold text-ink-900 outline-none transition-colors duration-150 focus:border-brand-orange focus:ring-[3px] focus:ring-brand-orange/15"
                          />
                        ))}
                      </div>

                      <FormError message={error} />

                      <p className="mt-3 text-center text-[13px] text-ink-400">
                        {resendIn > 0 ? (
                          `${t.resendIn} ${resendIn}s`
                        ) : (
                          <button
                            type="button"
                            onClick={resend}
                            className="inline-flex items-center gap-1.5 font-semibold text-[#b06a34] transition-colors duration-150 hover:text-ink-900 dark:text-[#f0a468]"
                          >
                            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {t.resend}
                          </button>
                        )}
                      </p>

                      <button
                        type="button"
                        onClick={submitOtp}
                        disabled={otp.join('').length < OTP_MIN || busy}
                        className={`${primaryBtn} mt-4 disabled:opacity-45`}
                      >
                        {t.verify}
                        <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  )
                ) : (
                  /* Officer flow — email/ID + password */
                  <form onSubmit={onFormSubmit} noValidate>
                    <h2 className="font-display text-2xl font-semibold text-ink-900">
                      {t.officerHeading}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-ink-700">
                      {t.officerSub}
                    </p>

                    <Field icon={<Mail className="h-[17px] w-[17px]" strokeWidth={1.5} />} className="mt-5">
                      <label className="sr-only" htmlFor="auth-id">
                        {t.idLabel}
                      </label>
                      <input
                        id="auth-id"
                        type="text"
                        autoComplete="username"
                        value={officerId}
                        onChange={(e) => setOfficerId(e.target.value)}
                        placeholder={t.idPlaceholder}
                        className={fieldInput}
                      />
                    </Field>

                    <Field icon={<Lock className="h-[17px] w-[17px]" strokeWidth={1.5} />} className="mt-3">
                      <label className="sr-only" htmlFor="auth-pw">
                        {t.pwLabel}
                      </label>
                      <input
                        id="auth-pw"
                        type={showPw ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={officerPw}
                        onChange={(e) => setOfficerPw(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitOfficer()
                        }}
                        placeholder={t.pwLabel}
                        className={fieldInput}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                        className="shrink-0 text-ink-400 transition-colors duration-150 hover:text-ink-900"
                      >
                        {showPw ? (
                          <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </Field>

                    <div className="mt-2 text-right">
                      <button type="button" className={orangeLink}>
                        {t.forgot}
                      </button>
                    </div>

                    <FormError message={error} />

                    <button
                      type="button"
                      onClick={submitOfficer}
                      disabled={busy}
                      className={`${primaryBtn} mt-4 disabled:opacity-45`}
                    >
                      {t.officerBtn}
                      <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </button>

                    <p className="mt-4 text-center text-xs leading-relaxed text-ink-400">
                      {t.trouble}
                    </p>
                  </form>
                )}
              </div>

              {/* Footer line — citizen mode toggles sign-in / sign-up */}
              {role === 'citizen' && (
                <>
                  <p className="mt-6 text-center text-[13px] text-ink-400">
                    {mode === 'signin' ? t.footerSignup : t.footerSignin}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
                        setStep('form')
                        setError(null)
                      }}
                      className={orangeLink}
                    >
                      {mode === 'signin' ? t.footerSignupAction : t.footerSigninAction}
                    </button>
                  </p>
                  {/* Escape hatch for reporters who don't want an account at
                      all — routes to the public anonymous complaint page. */}
                  <p className="mt-3 text-center text-[13px] text-ink-400">
                    {t.anonComplaintIntro}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        window.history.pushState(null, '', '/file-complaint')
                        window.dispatchEvent(new Event('popstate'))
                      }}
                      className={orangeLink}
                    >
                      {t.anonComplaintAction}
                    </button>
                  </p>
                </>
              )}

              {/* Demo escape hatch — guest mode, works even without Supabase. */}
              <button
                type="button"
                onClick={() => signInAsGuest(role)}
                className="mt-3 block w-full text-center text-[13px] text-ink-400 underline decoration-ink-400/30 underline-offset-4 transition-colors duration-150 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange"
              >
                {t.continueAnyway}
              </button>

            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
