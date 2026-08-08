import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
import { DecorativeBackground } from '../../components/DecorativeBackground';
import type { Theme } from '../../hooks/useTheme';
import { adminLoginApi } from '../../api/adminApi';

interface AdminLoginPageProps {
  theme: Theme;
  onToggleTheme: () => void;
  onSuccess: () => void;
}

export function AdminLoginPage({ theme, onToggleTheme, onSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await adminLoginApi(email, password);

    setLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="relative min-h-screen bg-canvas font-sans text-ink-900 selection:bg-brand-orange/20 selection:text-ink-900">
      <DecorativeBackground insetForSidebar={false} />

      {/* Top Bar Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              window.history.pushState(null, '', '/')
              window.dispatchEvent(new Event('popstate'))
            }}
            className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface/80 px-3 py-1.5 text-xs font-semibold text-ink-700 backdrop-blur-sm transition-colors hover:border-brand-orange hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Portal</span>
          </button>
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-[#b06a34] dark:text-[#f0a468] sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Official Portal
          </span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Center Form Container */}
      <main className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Box */}
          <div className="rounded-3xl border border-border-subtle bg-surface-white/90 p-8 shadow-soft backdrop-blur-md dark:bg-surface-white/80 md:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/10 text-brand-orange dark:bg-brand-navy/40">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 md:text-3xl">
                Admin Authentication
              </h1>
              <p className="mt-2 text-sm text-ink-400">
                Secure access for authorized SevaNest government officials
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-2xl bg-brand-orange/10 px-4 py-3.5 text-xs font-medium text-[#b06a34] dark:text-[#f0a468] border border-brand-orange/20 flex items-start gap-2.5 animate-fadeIn"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-orange" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Government Email
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-canvas/60 px-4 py-3.5 transition-colors duration-150 focus-within:border-brand-orange focus-within:ring-[3px] focus-within:ring-brand-orange/15">
                  <Mail className="h-5 w-5 shrink-0 text-ink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                    className="w-full min-w-0 bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-canvas/60 px-4 py-3.5 transition-colors duration-150 focus-within:border-brand-orange focus-within:ring-[3px] focus-within:ring-brand-orange/15">
                  <Lock className="h-5 w-5 shrink-0 text-ink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full min-w-0 bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-ink-400 hover:text-ink-700 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-white shadow-soft transition-all duration-150 hover:bg-[#2d2839] focus-visible:outline-2 focus-visible:outline-brand-orange disabled:opacity-70 dark:bg-white dark:text-ink-900 dark:hover:bg-[#e2dfd7]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Note Footer */}
            <div className="mt-8 text-center border-t border-border-subtle pt-6">
              <p className="text-xs text-ink-400">
                Restricted to authorized system administrators only.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
