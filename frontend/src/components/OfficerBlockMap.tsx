import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MapPin,
  Plus,
  Minus,
  Search
} from 'lucide-react'
import { blockMap, type BlockWard, type Status } from '../data'
import { APIProvider, Map, Marker, Circle, InfoWindow, useMap } from '@vis.gl/react-google-maps'

/* ── Status grammar ────────────────────────────────────────── */
const STATUS_META: Record<
  Status,
  { dot: string; chip: string; icon: typeof Clock3; meaning: string }
> = {
  Open: {
    dot: 'bg-brand-navy',
    chip: 'bg-brand-navy/10 text-brand-navy dark:bg-[#f2f0ec]/15 dark:text-[#f2f0ec]',
    icon: CircleAlert,
    meaning: 'New — no official has reviewed it yet',
  },
  'Under review': {
    dot: 'bg-brand-orange',
    chip: 'bg-brand-orange/15 text-[#b06a34] dark:text-[#f0a468]',
    icon: Clock3,
    meaning: 'An official is working on it',
  },
  Resolved: {
    dot: 'bg-brand-mint',
    chip: 'bg-brand-mint/20 text-[#3d7d6b] dark:text-[#7fd1bb]',
    icon: CheckCircle2,
    meaning: 'Closed with a public note',
  },
}

const STATUS_ORDER: Status[] = ['Open', 'Under review', 'Resolved']

/* ── Map Data & Coordinates ────────────────────────────────── */
const WARD_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'college-road': { lat: 22.485, lng: 88.105 },
  'ward-3': { lat: 22.480, lng: 88.125 },
  'purba-para': { lat: 22.475, lng: 88.145 },
  'ward-7': { lat: 22.465, lng: 88.100 },
  'fuleswar': { lat: 22.460, lng: 88.120 },
  'durganagar': { lat: 22.455, lng: 88.140 },
  'ward-9': { lat: 22.445, lng: 88.105 },
  'ward-8': { lat: 22.440, lng: 88.125 },
}

const MAP_STYLES = [
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#8a837b' }] },
  { featureType: 'administrative', elementType: 'labels.text.stroke', stylers: [{ color: '#dedbd3' }, { weight: 3 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c3c9c0' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#97a193' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#dedbd3' }] },
  { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ color: '#d5d1c8' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#d5d1c8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#a3a099' }, { weight: 1 }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#8b8882' }, { weight: 1.5 }] }
];

function statusCount(ward: BlockWard, status: Status): number {
  return ward.incidents.filter((i) => i.status === status).length
}

function dominantStatus(ward: BlockWard): Status {
  const counts = STATUS_ORDER.map((s) => statusCount(ward, s))
  const max = Math.max(...counts)
  return STATUS_ORDER[counts.indexOf(max)]
}

const MapControls = () => {
  const map = useMap();
  
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-soft text-ink-700 hover:bg-canvas transition-colors">
        <Search className="h-5 w-5" />
      </button>
      <div className="flex flex-col rounded-full bg-surface shadow-soft overflow-hidden">
        <button 
          onClick={() => map?.setZoom((map.getZoom() || 13) + 1)}
          className="flex h-10 w-10 items-center justify-center text-ink-700 hover:bg-canvas transition-colors border-b border-border-subtle"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button 
          onClick={() => map?.setZoom((map.getZoom() || 13) - 1)}
          className="flex h-10 w-10 items-center justify-center text-ink-700 hover:bg-canvas transition-colors"
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export function OfficerBlockMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const totals = { Open: 0, 'Under review': 0, Resolved: 0 } as Record<Status, number>
    let oldest: { ward: BlockWard; age: number; title: string; ref: string } | null = null
    
    for (const ward of blockMap.wards) {
      for (const inc of ward.incidents) {
        totals[inc.status] += 1
        if (inc.status !== 'Resolved' && (!oldest || inc.age > oldest.age)) {
          oldest = { ward, age: inc.age, title: inc.title, ref: inc.ref }
        }
      }
    }
    
    const mostActive = [...blockMap.wards].sort((a, b) => {
      const d = b.incidents.length - a.incidents.length
      if (d !== 0) return d
      return Math.max(...b.incidents.map((i) => i.age)) - Math.max(...a.incidents.map((i) => i.age))
    })[0]
    
    const density = [...blockMap.wards]
      .map((ward) => ({
        ward,
        active: ward.incidents.filter((i) => i.status !== 'Resolved').length,
      }))
      .sort((a, b) => b.active - a.active || a.ward.name.localeCompare(b.ward.name))
      
    return { totals, oldest, mostActive, density }
  }, [])

  const selected = blockMap.wards.find((w) => w.id === selectedId)
  const maxActive = stats.density[0]?.active || 1
  const totalReports = blockMap.wards.reduce((sum, w) => sum + w.incidents.length, 0)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr]">
      {/* ── Map card ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-2 shadow-soft md:p-3 max-md:p-2 relative overflow-hidden flex flex-col min-h-[600px]">
        <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-4">
          <div>
            <h3 className="font-display text-base font-semibold text-ink-900">
              {blockMap.block} block
            </h3>
            <p className="text-xs text-ink-400">
              {blockMap.districts}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink-700">
            {blockMap.wards.length} wards · {totalReports} reports
          </span>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden relative border border-border-subtle">
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
            <Map
              defaultCenter={{ lat: 22.460, lng: 88.120 }}
              defaultZoom={13.5}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              styles={MAP_STYLES}
              className="w-full h-full absolute inset-0"
            >
              <MapControls />
              
              {/* Heatmap / Density Overlays (Using Circle component) */}
              {blockMap.wards.map((ward) => {
                const coords = WARD_COORDINATES[ward.id]
                if (!coords) return null;
                
                const active = ward.incidents.filter(i => i.status !== 'Resolved').length;
                const radius = 200 + (active * 150);
                const color = active > 1 ? '#DD8F5C' : '#8CA89B';
                
                return (
                  <Circle
                    key={`heat-${ward.id}`}
                    center={coords}
                    radius={radius}
                    fillColor={color}
                    fillOpacity={0.15}
                    strokeColor={color}
                    strokeOpacity={0}
                    strokeWeight={0}
                    clickable={false}
                  />
                )
              })}

              {/* Data Points */}
              {blockMap.wards.map((ward) => {
                const coords = WARD_COORDINATES[ward.id]
                if (!coords) return null;
                
                const isHovered = hoveredId === ward.id;
                const isSelected = selectedId === ward.id;
                const dominant = dominantStatus(ward);
                const active = dominant === 'Resolved' ? false : true;
                const color = active ? '#E38F55' : '#6FBBA6';
                
                return (
                  <Marker 
                    key={`marker-${ward.id}`} 
                    position={coords}
                    onClick={() => setSelectedId(ward.id)}
                    onMouseOver={() => setHoveredId(ward.id)}
                    onMouseOut={() => setHoveredId(null)}
                    zIndex={isSelected ? 50 : isHovered ? 40 : 10}
                    icon={{
                      path: 'M 0, 0 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
                      fillColor: color,
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2.5,
                      scale: isSelected ? 1.25 : isHovered ? 1.1 : 1
                    }}
                  />
                )
              })}

              {/* Floating Tooltips */}
              {blockMap.wards.map((ward) => {
                const coords = WARD_COORDINATES[ward.id]
                if (!coords) return null;
                
                const isHovered = hoveredId === ward.id;
                const isSelected = selectedId === ward.id;
                const dominant = dominantStatus(ward);
                const active = dominant === 'Resolved' ? false : true;

                if (!isHovered && !isSelected) return null;

                return (
                  <InfoWindow
                    key={`info-${ward.id}`}
                    position={coords}
                    headerDisabled={true}
                    disableAutoPan={true}
                    pixelOffset={[0, -25]}
                    style={{ padding: 0 }}
                  >
                    <div className="rounded-[20px] bg-surface px-4 py-3 shadow-soft min-w-[max-content]">
                      <p className="font-display text-sm font-semibold text-ink-900 mb-1">{ward.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${active ? 'bg-brand-orange' : 'bg-brand-mint'}`}></span>
                        <span className="text-xs text-ink-400">
                          Resolution Speed: {ward.incidents.length} cases
                        </span>
                      </div>
                    </div>
                  </InfoWindow>
                )
              })}
            </Map>
          </APIProvider>
        </div>
      </div>

      {/* ── Right rail: block pulse → ward drill-down ─────── */}
      <div className="flex flex-col rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
        {selected ? (
          /* Ward drill-down */
          <>
            <button
              onClick={() => setSelectedId(null)}
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-400 transition-colors duration-150 hover:bg-canvas hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              All wards
            </button>

            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink-900">
                  {selected.name}
                </h3>
                <p className="mt-0.5 text-xs text-ink-400">{selected.sub}</p>
              </div>
              <span className="shrink-0 rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink-700">
                {selected.incidents.length}{' '}
                {selected.incidents.length === 1 ? 'report' : 'reports'}
              </span>
            </div>

            {/* Status counts */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {STATUS_ORDER.map((status) => {
                const meta = STATUS_META[status]
                const Icon = meta.icon
                const count = statusCount(selected, status)
                const iconColor =
                  status === 'Open'
                    ? 'text-brand-navy'
                    : status === 'Under review'
                      ? 'text-[#b06a34] dark:text-[#f0a468]'
                      : 'text-[#3d7d6b] dark:text-[#7fd1bb]'
                return (
                  <div
                    key={status}
                    className="rounded-xl bg-canvas/60 px-2 py-2.5 text-center"
                  >
                    <Icon
                      className={`mx-auto h-4 w-4 ${iconColor}`}
                      strokeWidth={1.75}
                    />
                    <dd className="mt-1 font-display text-lg font-semibold text-ink-900">
                      {count}
                    </dd>
                    <dt className="text-[10px] leading-tight text-ink-400">
                      {status}
                    </dt>
                  </div>
                )
              })}
            </div>

            {/* Case list: title > ref · day > status */}
            <ul className="mt-5 flex flex-col gap-2.5">
              {[...selected.incidents]
                .sort((a, b) => b.age - a.age)
                .map((incident) => {
                  const style = STATUS_META[incident.status]
                  return (
                    <li
                      key={incident.ref}
                      className="flex items-center gap-3 rounded-xl bg-canvas/60 px-3.5 py-3"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-ink-900">
                          {incident.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-ink-400">
                          {incident.ref} · Day {incident.age}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.chip}`}
                      >
                        {incident.status}
                      </span>
                    </li>
                  )
                })}
            </ul>

            <p className="mt-5 rounded-xl bg-brand-mint/15 px-4 py-3 text-xs leading-relaxed text-ink-700">
              Citizens report anonymously — you see ward-level pins only, never
              the exact house. Open a report from your desk for full context.
            </p>
          </>
        ) : (
          /* ── Block pulse — the useful default ───────────── */
          <>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold text-ink-900">
                Block pulse
              </h3>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/15">
                <MapPin className="h-4 w-4 text-brand-orange" strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-400">
              What needs attention across the block right now.
            </p>

            {/* Totals */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {STATUS_ORDER.map((status) => {
                const meta = STATUS_META[status]
                const Icon = meta.icon
                return (
                  <div
                    key={status}
                    className="rounded-xl bg-canvas/60 px-2 py-2.5 text-center"
                  >
                    <Icon
                      className={`mx-auto h-4 w-4 ${
                        status === 'Open'
                          ? 'text-brand-navy'
                          : status === 'Under review'
                            ? 'text-[#b06a34] dark:text-[#f0a468]'
                            : 'text-[#3d7d6b] dark:text-[#7fd1bb]'
                      }`}
                      strokeWidth={1.75}
                    />
                    <dd className="mt-1 font-display text-lg font-semibold text-ink-900">
                      {stats.totals[status]}
                    </dd>
                    <dt className="text-[10px] leading-tight text-ink-400">
                      {status}
                    </dt>
                  </div>
                )
              })}
            </div>

            {/* Oldest unresolved — auto-surfaced urgency */}
            {stats.oldest && (
              <div className="mt-4 rounded-2xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b06a34] dark:text-[#f0a468]">
                  Oldest active case
                </p>
                <p className="mt-1 text-[13px] font-semibold text-ink-900">
                  {stats.oldest.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {stats.oldest.ref} · Day {stats.oldest.age} of 7 ·{' '}
                  <button
                    onClick={() => setSelectedId(stats.oldest!.ward.id)}
                    className="font-semibold text-brand-navy underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-brand-orange"
                  >
                    {stats.oldest.ward.name} →
                  </button>
                </p>
              </div>
            )}

            {/* Density — wards ranked by active reports */}
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">
              By ward · active reports
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {stats.density.map(({ ward, active }) => (
                <li key={ward.id}>
                  <button
                    onClick={() => setSelectedId(ward.id)}
                    className="group flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors duration-150 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand-orange"
                  >
                    <span className="w-24 shrink-0 truncate text-[13px] font-medium text-ink-900">
                      {ward.name}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas">
                      <span
                        className="block h-full rounded-full bg-brand-navy transition-all duration-300"
                        style={{ width: `${(active / maxActive) * 100}%` }}
                      />
                    </span>
                    <span
                      className={`w-8 shrink-0 text-right font-display text-sm font-semibold ${
                        active > 0 ? 'text-ink-900' : 'text-ink-400'
                      }`}
                    >
                      {active}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-5 flex items-start gap-2 rounded-xl bg-canvas/60 px-4 py-3 text-xs leading-relaxed text-ink-400">
              <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              Select a ward on the map to drill into its cases.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
