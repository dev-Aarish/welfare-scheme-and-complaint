import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  Navigation,
  Building2,
  UserCheck,
  MessageSquare,
  History,
  Send,
  Lock,
  Check
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
import { DecorativeBackground } from '../../components/DecorativeBackground';
import type { Theme } from '../../hooks/useTheme';
import {
  fetchAdminComplaintById,
  updateComplaintStatusApi,
  assignComplaintApi,
  addComplaintRemarkApi,
  fetchWorkflowMetaDataApi,
  getAdminUser,
  clearAdminAuth,
  type ComplaintItem,
  type DepartmentItem,
  type OfficerItem,
  type RemarkItem,
} from '../../api/adminApi';

interface AdminComplaintDetailPageProps {
  complaintId: string;
  theme: Theme;
  onToggleTheme: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const WORKFLOW_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ESCALATED', label: 'Escalated' },
];

export function AdminComplaintDetailPage({
  complaintId,
  theme,
  onToggleTheme,
  onNavigate,
  onLogout,
}: AdminComplaintDetailPageProps) {
  const adminUser = getAdminUser();
  const [complaint, setComplaint] = useState<ComplaintItem | null>(null);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [officers, setOfficers] = useState<OfficerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workflow control state
  const [selectedStatus, setSelectedStatus] = useState<string>('OPEN');
  const [statusRemark, setStatusRemark] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  // Assignment state
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string | null>(null);

  // Remarks state
  const [newRemarkText, setNewRemarkText] = useState('');
  const [postingRemark, setPostingRemark] = useState(false);

  // Load complaint & workflow metadata
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [compRes, metaRes] = await Promise.all([
      fetchAdminComplaintById(complaintId),
      fetchWorkflowMetaDataApi(),
    ]);

    if (compRes.success && compRes.complaint) {
      setComplaint(compRes.complaint);
      setSelectedStatus(compRes.complaint.status);
      setSelectedDeptId(compRes.complaint.assignedDepartment?.id || '');
      setSelectedOfficerId(compRes.complaint.assignedOfficer?.id || '');
    } else {
      if (compRes.status === 401 || compRes.status === 403) {
        clearAdminAuth();
        onLogout();
        return;
      }
      setError(compRes.error || `Could not find complaint details for '${complaintId}'`);
    }

    if (metaRes.success && metaRes.departments && metaRes.officers) {
      setDepartments(metaRes.departments);
      setOfficers(metaRes.officers);
    }

    setLoading(false);
  }, [complaintId, onLogout]);

  useEffect(() => {
    if (complaintId) {
      loadData();
    }
  }, [complaintId, loadData]);

  // Handle Status Update Submit
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedStatus) return;

    setStatusUpdating(true);
    setStatusSuccessMsg(null);
    setError(null);

    const res = await updateComplaintStatusApi(complaint.id, selectedStatus, statusRemark);

    setStatusUpdating(false);

    if (res.success && res.complaint) {
      setComplaint(res.complaint);
      setStatusRemark('');
      setStatusSuccessMsg(`Complaint status successfully updated to ${res.complaint.status}!`);
      setTimeout(() => setStatusSuccessMsg(null), 4000);
    } else {
      if (res.status === 401 || res.status === 403) {
        clearAdminAuth();
        onLogout();
        return;
      }
      setError(res.error || 'Failed to update complaint status');
    }
  };

  // Handle Assignment Submit
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setAssigning(true);
    setAssignSuccessMsg(null);
    setError(null);

    const res = await assignComplaintApi(complaint.id, selectedDeptId, selectedOfficerId);

    setAssigning(false);

    if (res.success && res.complaint) {
      setComplaint(res.complaint);
      setSelectedStatus(res.complaint.status);
      setAssignSuccessMsg('Assignment details updated successfully!');
      setTimeout(() => setAssignSuccessMsg(null), 4000);
    } else {
      if (res.status === 401 || res.status === 403) {
        clearAdminAuth();
        onLogout();
        return;
      }
      setError(res.error || 'Failed to update complaint assignment');
    }
  };

  // Handle Add Remark Submit
  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !newRemarkText.trim()) return;

    setPostingRemark(true);
    setError(null);

    const res = await addComplaintRemarkApi(complaint.id, newRemarkText.trim());

    setPostingRemark(false);

    if (res.success && res.remark) {
      setNewRemarkText('');
      setComplaint((prev) =>
        prev
          ? {
              ...prev,
              remarks: [res.remark as RemarkItem, ...(prev.remarks || [])],
            }
          : prev
      );
    } else {
      if (res.status === 401 || res.status === 403) {
        clearAdminAuth();
        onLogout();
        return;
      }
      setError(res.error || 'Failed to post admin remark');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy/10 px-3.5 py-1.5 text-xs font-semibold text-brand-navy dark:bg-brand-navy/40 dark:text-[#f2f0ec]">
            <AlertCircle className="h-4 w-4" />
            Open / Pending
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-3.5 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <UserCheck className="h-4 w-4" />
            Assigned
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange/15 px-3.5 py-1.5 text-xs font-semibold text-[#b06a34] dark:text-[#f0a468]">
            <Clock className="h-4 w-4" />
            In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mint/25 px-3.5 py-1.5 text-xs font-semibold text-[#3d7d6b] dark:text-[#7fd1bb]">
            <CheckCircle2 className="h-4 w-4" />
            Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/20 px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <Lock className="h-4 w-4" />
            Closed
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Escalated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-400/10 px-3.5 py-1.5 text-xs font-semibold text-ink-700">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border border-red-500/20">
            High Urgency
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center rounded-md bg-amber500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Medium Priority
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-canvas font-sans text-ink-900 selection:bg-brand-orange/20 selection:text-ink-900">
      <DecorativeBackground insetForSidebar={false} />

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/admin/complaints')}
              className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-soft transition-colors hover:border-brand-orange hover:text-brand-orange"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Complaints</span>
            </button>
            <Logo />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-[#b06a34] dark:text-[#f0a468] sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              {adminUser?.name || 'System Admin'}
            </span>

            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-ink-400">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            <p className="text-sm font-medium">Fetching complaint inspection details &amp; workflow logs...</p>
          </div>
        ) : error || !complaint ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-brand-orange/20 bg-surface p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-ink-900">Complaint Not Found</h2>
            <p className="mt-2 text-xs text-ink-400">{error || 'The requested complaint reference does not exist.'}</p>
            <button
              type="button"
              onClick={() => onNavigate('/admin/complaints')}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-navy px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-soft"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Complaints List</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Hero Box */}
            <div className="rounded-3xl border border-border-subtle bg-surface/90 p-6 shadow-soft backdrop-blur-md md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-xl">
                      {complaint.ref}
                    </span>
                    {getPriorityBadge(complaint.priority)}
                  </div>
                  <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-900 md:text-3xl">
                    {complaint.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-brand-orange" />
                      {complaint.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-ink-400" />
                      Submitted on{' '}
                      {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div>{getStatusBadge(complaint.status)}</div>
              </div>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Grid Layout: Left Column (Details & Evidence) vs Right Column (Workflow Controls & Audit Trail) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column (2 Cols wide on desktop) */}
              <div className="space-y-6 lg:col-span-2">
                {/* Complaint Description Narrative */}
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-soft md:p-8">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                    <FileText className="h-5 w-5 text-brand-navy dark:text-brand-orange" />
                    <span>Grievance Description</span>
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-ink-700 whitespace-pre-wrap">
                    {complaint.description}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border-subtle pt-6 text-xs sm:grid-cols-4">
                    <div>
                      <span className="text-ink-400 block font-semibold uppercase tracking-wider">Category</span>
                      <span className="font-semibold text-ink-900 mt-1 block">
                        {complaint.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-400 block font-semibold uppercase tracking-wider">Priority</span>
                      <span className="font-semibold text-ink-900 mt-1 block">
                        {complaint.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-400 block font-semibold uppercase tracking-wider">Assigned Dept</span>
                      <span className="font-semibold text-ink-900 mt-1 block">
                        {complaint.assignedDepartment?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-400 block font-semibold uppercase tracking-wider">Assigned Officer</span>
                      <span className="font-semibold text-ink-900 mt-1 block">
                        {complaint.assignedOfficer?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Map Coordinates */}
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-soft md:p-8">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                    <Navigation className="h-5 w-5 text-brand-orange" />
                    <span>Location &amp; Geotag Coordinates</span>
                  </h2>

                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border-subtle bg-canvas/60 p-4">
                    <div>
                      <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Reported Location Address</p>
                      <p className="mt-1 text-sm font-semibold text-ink-900">{complaint.location}</p>
                    </div>
                    <div className="flex gap-4 border-t border-border-subtle pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-6">
                      <div>
                        <p className="text-[11px] font-semibold text-ink-400 uppercase">Latitude</p>
                        <p className="font-mono text-xs font-bold text-ink-900">{complaint.latitude ?? 22.4831}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-ink-400 uppercase">Longitude</p>
                        <p className="font-mono text-xs font-bold text-ink-900">{complaint.longitude ?? 88.1092}</p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Map Visual */}
                  <div className="mt-4 relative h-60 w-full overflow-hidden rounded-2xl border border-border-subtle bg-canvas/80 flex items-center justify-center">
                    <svg className="absolute inset-0 h-full w-full opacity-30 text-brand-navy dark:text-brand-mint" fill="none" stroke="currentColor">
                      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
                      <div className="relative mb-2">
                        <div className="absolute -inset-2 animate-ping rounded-full bg-brand-orange/40" />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange text-white shadow-soft">
                          <MapPin className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-xs font-bold text-ink-900">{complaint.location}</p>
                      <a
                        href={`https://maps.google.com/?q=${complaint.latitude ?? 22.4831},${complaint.longitude ?? 88.1092}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-orange hover:underline"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Citizen Details Card */}
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-soft">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
                    <User className="h-4 w-4 text-brand-navy dark:text-brand-mint" />
                    <span>Citizen Contact Information</span>
                  </h2>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                    <div className="rounded-2xl border border-border-subtle bg-canvas/40 p-3.5">
                      <p className="text-ink-400 font-medium">Full Name</p>
                      <p className="font-bold text-ink-900 mt-1">{complaint.citizen?.name || 'Registered Citizen'}</p>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-canvas/40 p-3.5">
                      <p className="text-ink-400 font-medium">Email Address</p>
                      <p className="font-bold text-ink-900 mt-1">{complaint.citizen?.email || 'N/A'}</p>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-canvas/40 p-3.5">
                      <p className="text-ink-400 font-medium">Phone Contact</p>
                      <p className="font-bold text-ink-900 mt-1">{complaint.citizen?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence Image Card */}
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-soft">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
                    <ImageIcon className="h-4 w-4 text-brand-orange" />
                    <span>Uploaded Photo Evidence</span>
                  </h2>

                  {complaint.imageUrl ? (
                    <div className="mt-4 group relative overflow-hidden rounded-2xl border border-border-subtle">
                      <img
                        src={complaint.imageUrl}
                        alt="Uploaded evidence"
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <a
                        href={complaint.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-surface/90 px-3 py-1.5 text-[11px] font-bold text-ink-900 shadow-soft backdrop-blur-sm hover:bg-surface"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Full Resolution</span>
                      </a>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-canvas/40 py-8 text-center">
                      <ImageIcon className="h-6 w-6 text-ink-400 opacity-50" />
                      <p className="mt-1 text-xs font-semibold text-ink-400">No image uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Workflow Control Panels & Escalation Status */}
              <div className="space-y-6">
                {/* 0. ESCALATION STATUS CARD */}
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-soft">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
                    <AlertTriangle className="h-4 w-4 text-brand-orange" />
                    <span>Overdue Escalation Monitoring</span>
                  </h2>

                  {complaint.isEscalated ? (
                    <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs">
                          !
                        </span>
                        <div>
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                            Escalated · Level {complaint.escalationLevel || 1}
                          </p>
                          <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
                            Unresolved beyond configured threshold (7 days)
                          </p>
                        </div>
                      </div>

                      {complaint.escalatedAt && (
                        <p className="mt-3 text-[11px] text-ink-400 border-t border-amber-500/20 pt-2 font-medium">
                          Escalation recorded on:{' '}
                          <span className="font-bold text-ink-900">
                            {new Date(complaint.escalatedAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-border-subtle bg-canvas/40 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink-700">
                        <CheckCircle2 className="h-4 w-4 text-brand-mint" />
                        <span>Status: Normal (Within SLA threshold)</span>
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-ink-400">
                        This complaint is within the allowed 7-day resolution window.
                      </p>
                    </div>
                  )}
                </div>

                {/* 1. STATUS WORKFLOW CONTROL PANEL */}
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-lift">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
                    <Clock className="h-4 w-4 text-brand-orange" />
                    <span>Update Complaint Status</span>
                  </h2>

                  {statusSuccessMsg && (
                    <div className="mt-3 flex items-center gap-2 rounded-2xl bg-brand-mint/20 border border-brand-mint/30 px-3.5 py-2.5 text-xs font-semibold text-[#3d7d6b] dark:text-[#7fd1bb]">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>{statusSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleStatusUpdate} className="mt-4 space-y-4">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                        Workflow Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full rounded-2xl border border-border-subtle bg-canvas/70 px-3.5 py-2.5 text-xs font-semibold text-ink-900 focus:border-brand-orange focus:outline-none"
                      >
                        {WORKFLOW_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                        Audit Note / Status Remark
                      </label>
                      <input
                        type="text"
                        value={statusRemark}
                        onChange={(e) => setStatusRemark(e.target.value)}
                        placeholder="Reason or inspection notes for status update..."
                        className="w-full rounded-2xl border border-border-subtle bg-canvas/70 px-3.5 py-2.5 text-xs text-ink-900 placeholder-ink-400 focus:border-brand-orange focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={statusUpdating}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-soft transition-all hover:bg-[#2d2839] disabled:opacity-50"
                    >
                      {statusUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-brand-orange" />
                          <span>Update Status</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* 2. ASSIGNMENT CONTROL PANEL */}
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-lift">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
                    <Building2 className="h-4 w-4 text-brand-navy dark:text-brand-orange" />
                    <span>Assign Department &amp; Officer</span>
                  </h2>

                  {assignSuccessMsg && (
                    <div className="mt-3 flex items-center gap-2 rounded-2xl bg-brand-mint/20 border border-brand-mint/30 px-3.5 py-2.5 text-xs font-semibold text-[#3d7d6b] dark:text-[#7fd1bb]">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>{assignSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleAssign} className="mt-4 space-y-4">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                        Department
                      </label>
                      <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        className="w-full rounded-2xl border border-border-subtle bg-canvas/70 px-3.5 py-2.5 text-xs font-semibold text-ink-900 focus:border-brand-orange focus:outline-none"
                      >
                        <option value="">-- Select Department --</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                        Assigned Officer
                      </label>
                      <select
                        value={selectedOfficerId}
                        onChange={(e) => setSelectedOfficerId(e.target.value)}
                        className="w-full rounded-2xl border border-border-subtle bg-canvas/70 px-3.5 py-2.5 text-xs font-semibold text-ink-900 focus:border-brand-orange focus:outline-none"
                      >
                        <option value="">-- Select Officer --</option>
                        {officers.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} ({o.designation || 'Officer'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={assigning}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-soft transition-all hover:bg-[#2d2839] disabled:opacity-50"
                    >
                      {assigning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
                          <span>Assigning...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 text-brand-orange" />
                          <span>Save Assignment</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* 3. ADMIN REMARKS SECTION */}
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-soft">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
                    <MessageSquare className="h-4 w-4 text-brand-orange" />
                    <span>Admin Remarks ({complaint.remarks?.length || 0})</span>
                  </h2>

                  <form onSubmit={handleAddRemark} className="mt-4">
                    <textarea
                      rows={3}
                      value={newRemarkText}
                      onChange={(e) => setNewRemarkText(e.target.value)}
                      placeholder="Write an administrative remark or internal instruction..."
                      className="w-full rounded-2xl border border-border-subtle bg-canvas/70 p-3 text-xs text-ink-900 placeholder-ink-400 focus:border-brand-orange focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={postingRemark || !newRemarkText.trim()}
                      className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-[#2d2839] disabled:opacity-40"
                    >
                      {postingRemark ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5 text-brand-orange" />
                      )}
                      <span>Post Remark</span>
                    </button>
                  </form>

                  {/* List of existing remarks */}
                  <div className="mt-5 space-y-3 max-h-60 overflow-y-auto pr-1">
                    {complaint.remarks && complaint.remarks.length > 0 ? (
                      complaint.remarks.map((r) => (
                        <div key={r.id} className="rounded-2xl border border-border-subtle bg-canvas/50 p-3 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-ink-400 font-semibold mb-1">
                            <span className="text-ink-900 font-bold">{r.adminName}</span>
                            <span>{new Date(r.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-ink-700 leading-relaxed">{r.remark}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-ink-400 py-3 italic">No administrative remarks posted yet.</p>
                    )}
                  </div>
                </div>

                {/* 4. AUDIT TRAIL / STATUS HISTORY TIMELINE */}
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-soft">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
                    <History className="h-4 w-4 text-brand-navy dark:text-brand-mint" />
                    <span>Audit Trail &amp; Status History</span>
                  </h2>

                  <div className="mt-5 relative pl-4 border-l-2 border-border-subtle space-y-6">
                    {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                      complaint.statusHistory.map((h, i) => (
                        <div key={h.id || i} className="relative group">
                          {/* Timeline dot */}
                          <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-brand-orange shadow-sm" />
                          <div className="text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] font-bold text-ink-900 uppercase">
                                {h.previousStatus ? `${h.previousStatus} → ` : ''}
                                <span className="text-brand-orange">{h.newStatus}</span>
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-ink-400 font-medium">
                              Changed by <span className="font-semibold text-ink-900">{h.changedBy}</span> on{' '}
                              {new Date(h.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {h.remark && (
                              <p className="mt-1.5 rounded-xl bg-canvas/60 px-3 py-1.5 text-[11px] font-medium text-ink-700 italic border border-border-subtle">
                                "{h.remark}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-ink-400 py-2">
                        <p className="font-semibold text-ink-900">OPEN</p>
                        <p className="text-[11px]">Complaint created by citizen.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
