import type { Complaint, Status } from '../data'
import type { MyComplaint } from '../services/api'

/* Maps the backend ComplaintStatus enum to the three display statuses the
   portal's ComplaintRow grammar understands (design.md §7). */
const DB_STATUS_DISPLAY: Record<string, Status> = {
  RESOLVED: 'Resolved',
  CLOSED: 'Resolved',
  OPEN: 'Open',
  PENDING: 'Under review',
  ASSIGNED: 'Under review',
  IN_PROGRESS: 'Under review',
  ESCALATED: 'Under review',
}

export function displayStatus(dbStatus: string): Status {
  return DB_STATUS_DISPLAY[dbStatus] ?? 'Open'
}

/** "today" / "yesterday" / "n days ago" from an ISO timestamp. */
export function relativeTime(iso: string): string {
  const created = new Date(iso).getTime()
  if (Number.isNaN(created)) return 'recently'
  const days = Math.floor((Date.now() - created) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

/** Whole days elapsed since the complaint was filed. */
export function daysSince(iso: string): number {
  const created = new Date(iso).getTime()
  if (Number.isNaN(created)) return 0
  return Math.max(0, Math.floor((Date.now() - created) / 86_400_000))
}

/** Converts a backend complaint record into the display shape the rows use. */
export function toDisplayComplaint(complaint: MyComplaint): Complaint {
  return {
    id: complaint.id,
    ref: complaint.ref,
    title: complaint.title,
    location: complaint.location || complaint.category,
    time: relativeTime(complaint.createdAt),
    status: displayStatus(complaint.status),
    days: daysSince(complaint.createdAt),
  }
}

const DISPLAY_TO_DB_STATUS: Record<Status, string> = {
  Resolved: 'RESOLVED',
  'Under review': 'IN_PROGRESS',
  Open: 'OPEN',
}

/** Builds a minimal backend-shaped record from a display complaint. Used in
 *  guest (demo) mode, where there is no linked identity to fetch from the
 *  database, so clicking a demo card still opens a working tracking view. */
export function detailFromDisplay(complaint: Complaint): MyComplaint {
  const created = new Date(Date.now() - complaint.days * 86_400_000).toISOString()
  const status = DISPLAY_TO_DB_STATUS[complaint.status]
  return {
    id: complaint.id,
    ref: complaint.ref,
    title: complaint.title,
    description: null,
    location: complaint.location,
    category: 'OTHER',
    priority: 'MEDIUM',
    status,
    isEscalated: false,
    escalationLevel: 0,
    createdAt: created,
    updatedAt: created,
    statusHistory: [
      {
        id: `h-${complaint.id}`,
        previousStatus: null,
        newStatus: status,
        remark:
          complaint.status === 'Resolved'
            ? 'Complaint resolved.'
            : complaint.status === 'Under review'
              ? 'Complaint received and under review by the assigned department.'
              : 'Complaint filed by citizen.',
        createdAt: created,
      },
    ],
    remarks: [],
    evidence: [],
  }
}

/** Average days-to-resolution across the citizen's resolved complaints. Uses
 *  updatedAt − createdAt as a proxy for resolution time (the status flip
 *  bumps updatedAt). Returns null when there are no resolved reports. */
export function avgResolutionDays(complaints: MyComplaint[]): number | null {
  const resolved = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED',
  )
  if (resolved.length === 0) return null
  const total = resolved.reduce((sum, c) => {
    const created = new Date(c.createdAt).getTime()
    const updated = new Date(c.updatedAt).getTime()
    if (Number.isNaN(created) || Number.isNaN(updated)) return sum
    return sum + Math.max(0, (updated - created) / 86_400_000)
  }, 0)
  return Math.round((total / resolved.length) * 10) / 10
}
