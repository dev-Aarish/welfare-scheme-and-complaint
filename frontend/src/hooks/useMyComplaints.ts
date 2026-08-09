import { useEffect, useMemo, useState } from 'react'
import { fetchMyComplaints, type MyComplaint } from '../services/api'
import { complaints as demoComplaints, type Complaint } from '../data'
import { useAuth } from '../context/AuthContext'
import { avgResolutionDays, toDisplayComplaint } from '../utils/complaints'

/** Demo-data fallback used by guest (demo) mode, since there is no linked
 *  identity in the database to fetch. */
function demoAvgResolution(): number | null {
  const resolved = demoComplaints.filter((c) => c.status === 'Resolved')
  if (resolved.length === 0) return null
  return Math.round(
    (resolved.reduce((sum, c) => sum + c.days, 0) / resolved.length) * 10,
  ) / 10
}

/**
 * The citizen's complaints for the overview — real records from the backend
 * when signed in, the demo list when in guest mode. `enabled` gates the fetch
 * so it only runs while the overview tab is mounted.
 */
export function useMyComplaints(enabled = true) {
  const { guest } = useAuth()
  const [loading, setLoading] = useState(!guest && enabled)
  const [complaints, setComplaints] = useState<Complaint[]>(
    guest ? demoComplaints : [],
  )
  const [rawComplaints, setRawComplaints] = useState<MyComplaint[]>([])

  useEffect(() => {
    if (guest) {
      setComplaints(demoComplaints)
      setLoading(false)
      return
    }
    if (!enabled) return
    let alive = true
    setLoading(true)
    fetchMyComplaints().then((raw) => {
      if (!alive) return
      setRawComplaints(raw)
      setComplaints(raw.map(toDisplayComplaint))
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [guest, enabled])

  const avgResolution = useMemo(
    () => (guest ? demoAvgResolution() : avgResolutionDays(rawComplaints)),
    [guest, rawComplaints],
  )

  return { complaints, details: rawComplaints, avgResolution, loading }
}
