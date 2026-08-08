import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
import { DecorativeBackground } from '../../components/DecorativeBackground';
import { AdminDemoButton } from '../../components/AdminDemoButton';
import type { Theme } from '../../hooks/useTheme';
import {
  clearAdminAuth,
  fetchAdminDashboardStats,
  getAdminUser,
  type AdminUser,
  type ComplaintStats,
} from '../../api/adminApi';

interface AdminDashboardPageProps {
  theme: Theme;
  onToggleTheme: () => void;
  onLogout: () => void;
  onNavigate?: (path: string) => void;
}

export function AdminDashboardPage({
  theme,
  onToggleTheme,
  onLogout,
  onNavigate,
}: AdminDashboardPageProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => getAdminUser());
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [demo, setDemo] = useState(false);

  const loadDashboard = async (isManualRefresh = false, useDemo = demo) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    const res = await fetchAdminDashboardStats(useDemo);

    setLoading(false);
    setRefreshing(false);

    if (res.success && res.data) {
      setStats(res.data.stats);
      if (res.data.admin) {
        setAdmin(res.data.admin);
      }
    } else {
      if (res.status === 401 || res.status === 403) {
        onLogout(); // Invalid or expired JWT token -> redirect to login
      } else {
        setError(res.error || 'Unable to fetch dashboard statistics.');
      }
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const toggleDemo = () => {
    const next = !demo;
    setDemo(next);
    loadDashboard(false, next);
  };

  const handleLogoutClick = () => {
    clearAdminAuth();
    onLogout();
  };

  return (
    <div className="relative min-h-screen bg-canvas font-sans text-ink-900 selection:bg-brand-orange/20 selection:text-ink-900">
      <DecorativeBackground insetForSidebar={false} />

      {/* Admin Navbar Header */}
      <header className="relative z-20 border-b border-border-subtle bg-surface-white/80 px-6 py-4 backdrop-blur-md dark:bg-surface-white/70 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden items-center gap-1.5 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-[#b06a34] dark:text-[#f0a468] sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              ADMIN DASHBOARD
            </span>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/admin/complaints')}
                className="hidden items-center gap-1.5 rounded-xl border border-border-subtle bg-surface px-3 py-1 text-xs font-semibold text-ink-700 hover:border-brand-orange hover:text-brand-orange md:inline-flex"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Complaints List</span>
              </button>
            )}
          </div>

          {/* Admin User Info & Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Admin Profile Chip */}
            <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-canvas/60 px-3.5 py-1.5 dark:bg-surface-white/40">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-brand-orange dark:bg-white dark:text-ink-900">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="truncate text-xs font-bold text-ink-900">
                  {admin?.name || 'System Administrator'}
                </p>
                <p className="truncate text-[11px] text-ink-400">
                  {admin?.email || 'admin@sevanest.gov.in'}
                </p>
              </div>
              <span className="rounded-md bg-brand-navy px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase dark:bg-white dark:text-ink-900">
                {admin?.role || 'ADMIN'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing || loading}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface-white text-ink-700 shadow-sm transition-all hover:bg-canvas focus:outline-none disabled:opacity-50 dark:bg-surface-white dark:hover:bg-canvas"
              title="Refresh Dashboard Statistics"
              aria-label="Refresh statistics"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin text-brand-orange' : ''}`}
              />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 rounded-2xl bg-brand-navy px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-[#2d2839] focus:outline-none dark:bg-white dark:text-ink-900 dark:hover:bg-[#e2dfd7]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:px-10 lg:py-12">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 md:text-3xl">
              Portal Complaint Metrics Overview
            </h1>
            <p className="mt-1 text-sm text-ink-400">
              Real-time monitoring of citizen grievances and grievance redressal performance across wards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/admin/complaints')}
                className="flex items-center gap-2 rounded-2xl bg-brand-navy px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-soft transition-all hover:bg-[#2d2839]"
              >
                <FileText className="h-4 w-4 text-brand-orange" />
                <span>Manage All Complaints</span>
              </button>
            )}
            <div className="hidden items-center gap-2 text-xs font-medium text-ink-400 sm:flex">
              <Activity className="h-4 w-4 text-brand-mint" />
              <span>Live PostgreSQL Engine</span>
            </div>
          </div>
        </div>

        {/* Error Alert Box if query failed */}
        {error && (
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-brand-orange/30 bg-brand-orange/10 px-5 py-4 text-sm font-medium text-[#b06a34] dark:text-[#f0a468]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadDashboard()}
              className="rounded-xl bg-brand-navy px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider dark:bg-white dark:text-ink-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards Grid (5 Cards) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {/* Card 1: Total Complaints */}
          <SummaryCard
            title="Total Complaints"
            value={stats?.totalComplaints}
            loading={loading}
            bgColor="bg-brand-navy text-white dark:bg-[#282534]"
            icon={<FileText className="h-6 w-6 text-brand-orange" />}
            subtitle="All registered cases"
          />

          {/* Card 2: Pending */}
          <SummaryCard
            title="Pending"
            value={stats?.pendingComplaints}
            loading={loading}
            bgColor="bg-[#DD8F5C] text-white dark:bg-[#B36A3C]" // card-terracotta
            icon={<Clock className="h-6 w-6 text-white/90" />}
            subtitle="Awaiting triage"
          />

          {/* Card 3: In Progress */}
          <SummaryCard
            title="In Progress"
            value={stats?.inProgressComplaints}
            loading={loading}
            bgColor="bg-[#C3BC82] text-ink-900 dark:bg-[#7A744F] dark:text-white" // card-khaki
            icon={<Activity className="h-6 w-6 text-ink-900/80 dark:text-white/80" />}
            subtitle="Under officer review"
          />

          {/* Card 4: Resolved */}
          <SummaryCard
            title="Resolved"
            value={stats?.resolvedComplaints}
            loading={loading}
            bgColor="bg-[#8CA89B] text-white dark:bg-[#556E63]" // card-sage
            icon={<CheckCircle2 className="h-6 w-6 text-white/90" />}
            subtitle="Closed & verified"
          />

          {/* Card 5: Escalated */}
          <SummaryCard
            title="Escalated"
            value={stats?.escalatedComplaints}
            loading={loading}
            bgColor="bg-[#A6B1D6] text-ink-900 dark:bg-[#5C6690] dark:text-white cursor-pointer" // card-lavender
            icon={<AlertTriangle className="h-6 w-6 text-ink-900/80 dark:text-white/80" />}
            subtitle="Requires high priority"
            onClick={() => onNavigate && onNavigate('/admin/complaints?escalated=true')}
          />
        </div>

        {/* Detailed Breakdown Panel */}
        <div className="mt-10 rounded-3xl border border-border-subtle bg-surface-white/90 p-6 shadow-soft dark:bg-surface-white/80 md:p-8">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <h2 className="font-display text-lg font-bold text-ink-900">
              Complaints Status Ratio Breakdown
            </h2>
            <span className="text-xs font-semibold text-ink-400">
              {stats ? `${stats.totalComplaints} Active Records` : 'Loading...'}
            </span>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="h-8 w-full animate-pulse rounded-2xl bg-canvas" />
            ) : stats && stats.totalComplaints > 0 ? (
              <div>
                {/* Visual Progress Bar */}
                <div className="flex h-5 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    style={{
                      width: `${(stats.pendingComplaints / stats.totalComplaints) * 100}%`,
                    }}
                    className="bg-[#DD8F5C] transition-all duration-500"
                    title={`Pending: ${stats.pendingComplaints}`}
                  />
                  <div
                    style={{
                      width: `${(stats.inProgressComplaints / stats.totalComplaints) * 100}%`,
                    }}
                    className="bg-[#C3BC82] transition-all duration-500"
                    title={`In Progress: ${stats.inProgressComplaints}`}
                  />
                  <div
                    style={{
                      width: `${(stats.resolvedComplaints / stats.totalComplaints) * 100}%`,
                    }}
                    className="bg-[#8CA89B] transition-all duration-500"
                    title={`Resolved: ${stats.resolvedComplaints}`}
                  />
                  <div
                    style={{
                      width: `${(stats.escalatedComplaints / stats.totalComplaints) * 100}%`,
                    }}
                    className="bg-[#A6B1D6] transition-all duration-500"
                    title={`Escalated: ${stats.escalatedComplaints}`}
                  />
                </div>

                {/* Legend List */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <LegendItem
                    label="Pending"
                    count={stats.pendingComplaints}
                    total={stats.totalComplaints}
                    color="bg-[#DD8F5C]"
                  />
                  <LegendItem
                    label="In Progress"
                    count={stats.inProgressComplaints}
                    total={stats.totalComplaints}
                    color="bg-[#C3BC82]"
                  />
                  <LegendItem
                    label="Resolved"
                    count={stats.resolvedComplaints}
                    total={stats.totalComplaints}
                    color="bg-[#8CA89B]"
                  />
                  <LegendItem
                    label="Escalated"
                    count={stats.escalatedComplaints}
                    total={stats.totalComplaints}
                    color="bg-[#A6B1D6]"
                  />
                </div>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-ink-400">
                No complaint statistics available at this time.
              </p>
            )}
          </div>
        </div>
      </main>

      <AdminDemoButton demo={demo} onToggle={toggleDemo} />
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value?: number;
  loading: boolean;
  bgColor: string;
  icon: React.ReactNode;
  subtitle: string;
  onClick?: () => void;
}

function SummaryCard({
  title,
  value,
  loading,
  bgColor,
  icon,
  subtitle,
  onClick,
}: SummaryCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${bgColor}`}
    >
      {/* Decorative Line-Art Corner Doodle */}
      <svg
        className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 opacity-20"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10 50 Q 50 10 90 50 T 170 50" />
        <circle cx="50" cy="50" r="30" />
      </svg>

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            {title}
          </span>
          <div className="rounded-xl bg-white/10 p-2 backdrop-blur-sm">
            {icon}
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="h-10 w-20 animate-pulse rounded-xl bg-white/20" />
          ) : (
            <div className="font-display text-4xl font-extrabold tracking-tight">
              {value ?? 0}
            </div>
          )}
          <p className="mt-1 text-xs opacity-75">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function LegendItem({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-canvas/40 px-3.5 py-2.5">
      <div className={`h-3 w-3 shrink-0 rounded-full ${color}`} />
      <div>
        <p className="text-xs font-semibold text-ink-900">{label}</p>
        <p className="text-[11px] text-ink-400">
          {count} ({percentage}%)
        </p>
      </div>
    </div>
  );
}
