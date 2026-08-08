import { useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MapPin,
} from 'lucide-react'
import { blockMap, type BlockWard, type Status } from '../data'

/* ── Status grammar — one visual system, used everywhere ───────────────
   Every ward node carries BOTH:
     1. a count badge (top-centre inside the hex, always the total)
     2. a status chip (bottom, dominant status as dot + word + icon)
   Hue is never the only signal — shape (icon) pairs with colour. */
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

/* ── Schematic hex geometry (pointy-top, odd rows offset right) ────────
   An explicit abstraction — honest that this is a schematic, not a map. */
const R = 62
const W = Math.sqrt(3) * R
const V = 1.5 * R
const MARGIN_X = 220
const MARGIN_Y = 132

function hexCenter(ward: BlockWard) {
  return {
    x: MARGIN_X + ward.col * W + (ward.row % 2 ? W / 2 : 0),
    y: MARGIN_Y + ward.row * V,
  }
}

function hexPath(cx: number, cy: number, r = R): string {
  let d = ''
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (-90 + i * 60)
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return `${d}Z`
}

/** Odd-r offset → axial neighbour lookup for keyboard triage. */
function findNeighbor(
  ward: BlockWard,
  dir: 'up' | 'down' | 'left' | 'right',
): BlockWard | null {
  const { row, col } = ward
  const q = col - (row - (row & 1)) / 2
  const r = row
  let nq = q
  let nr = r
  if (dir === 'right') nq = q + 1
  else if (dir === 'left') nq = q - 1
  else if (dir === 'up') nr = r - 1
  else nr = r + 1
  const ncol = nq + (nr - (nr & 1)) / 2
  return (
    blockMap.wards.find((w) => w.row === nr && w.col === ncol) ?? null
  )
}

function statusCount(ward: BlockWard, status: Status): number {
  return ward.incidents.filter((i) => i.status === status).length
}

function dominantStatus(ward: BlockWard): Status {
  const counts = STATUS_ORDER.map((s) => statusCount(ward, s))
  const max = Math.max(...counts)
  return STATUS_ORDER[counts.indexOf(max)]
}

export function OfficerBlockMap() {
  /* null = block-pulse summary (the default, useful state). */
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const focusRefs = useRef<Map<string, SVGGElement>>(new Map())

  const stats = useMemo(() => {
    const totals = { Open: 0, 'Under review': 0, Resolved: 0 } as Record<
      Status,
      number
    >
    let oldest: {
      ward: BlockWard
      age: number
      title: string
      ref: string
    } | null = null
    for (const ward of blockMap.wards) {
      for (const inc of ward.incidents) {
        totals[inc.status] += 1
        if (inc.status !== 'Resolved' && (!oldest || inc.age > oldest.age)) {
          oldest = { ward, age: inc.age, title: inc.title, ref: inc.ref }
        }
      }
    }
    /* Most-active ward = most incidents; ties broken by oldest case. */
    const mostActive = [...blockMap.wards].sort((a, b) => {
      const d = b.incidents.length - a.incidents.length
      if (d !== 0) return d
      return (
        Math.max(...b.incidents.map((i) => i.age)) -
        Math.max(...a.incidents.map((i) => i.age))
      )
    })[0]
    /* Density — wards ranked by active (non-resolved) reports. */
    const density = [...blockMap.wards]
      .map((ward) => ({
        ward,
        active: ward.incidents.filter((i) => i.status !== 'Resolved').length,
      }))
      .sort(
        (a, b) => b.active - a.active || a.ward.name.localeCompare(b.ward.name),
      )
    return { totals, oldest, mostActive, density }
  }, [])

  const selected = blockMap.wards.find((w) => w.id === selectedId)
  const catchmentWards = blockMap.wards.filter((w) => w.catchment)
  const maxActive = stats.density[0]?.active || 1
  const totalReports = blockMap.wards.reduce(
    (sum, w) => sum + w.incidents.length,
    0,
  )

  const handleKey = (ward: BlockWard, e: React.KeyboardEvent<SVGGElement>) => {
    const dir =
      e.key === 'ArrowUp'
        ? 'up'
        : e.key === 'ArrowDown'
          ? 'down'
          : e.key === 'ArrowLeft'
            ? 'left'
            : e.key === 'ArrowRight'
              ? 'right'
              : null
    if (dir) {
      e.preventDefault()
      const next = findNeighbor(ward, dir)
      if (next) {
        setSelectedId(next.id)
        setHoveredId(next.id)
        focusRefs.current.get(next.id)?.focus()
      }
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedId(ward.id)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr]">
      {/* ── Map card ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-soft md:p-6 max-md:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-ink-900">
              {blockMap.block} block
            </h3>
            <p className="text-xs text-ink-400">
              {blockMap.districts} · schematic, not to scale
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink-700">
            {blockMap.wards.length} wards · {totalReports} reports
          </span>
        </div>

        {/* Horizontal scroll keeps the in-SVG labels legible on narrow
           screens instead of shrinking them below readability. */}
        <div className="mt-4 overflow-x-auto pb-1">
          <svg
            viewBox="0 0 780 520"
            role="group"
            aria-label={`Schematic ward map of ${blockMap.block} with report counts per ward`}
            className="h-auto w-full min-w-[560px] select-none"
          >
            {/* River — anchored along the west edge, labelled */}
            <path
              d="M60 30 C 90 80, 40 140, 75 200 C 105 260, 45 330, 80 390 C 100 430, 70 460, 80 500"
              className="stroke-brand-mint/50"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M100 25 C 130 85, 80 145, 115 205 C 145 265, 85 335, 120 395 C 140 435, 110 465, 120 505"
              className="stroke-brand-mint/30"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <g transform="rotate(-90 78 270)">
              <rect
                x="215"
                y="60"
                width="110"
                height="36"
                rx="18"
                className="fill-brand-mint/15 stroke-brand-mint/40"
                strokeWidth="1.5"
              />
              <text
                x="270"
                y="84"
                textAnchor="middle"
                className="fill-ink-700"
                fontSize="15"
                fontWeight="600"
                letterSpacing="2"
              >
                {blockMap.river} river
              </text>
            </g>

            {/* Ward fills — the interactive layer. All click / key / focus
               handling lives here; the labels render above and pass
               pointer events through, so the whole hex is one target. */}
            {blockMap.wards.map((ward) => {
              const isHovered = hoveredId === ward.id
              const isSelected = selectedId === ward.id
              const { x, y } = hexCenter(ward)
              return (
                <g
                  key={ward.id}
                  ref={(el) => {
                    if (el) focusRefs.current.set(ward.id, el)
                    else focusRefs.current.delete(ward.id)
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${ward.name}, ${ward.incidents.length} ${
                    ward.incidents.length === 1 ? 'report' : 'reports'
                  }, ${dominantStatus(ward)}`}
                  onClick={() => setSelectedId(ward.id)}
                  onKeyDown={(e) => handleKey(ward, e)}
                  onMouseEnter={() => setHoveredId(ward.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(ward.id)}
                  onBlur={() => setHoveredId(null)}
                  className="group cursor-pointer outline-none"
                >
                  <path
                    d={hexPath(x, y)}
                    className={`fill-surface transition-colors duration-150 ${
                      isSelected ? 'stroke-brand-orange' : 'stroke-border-subtle'
                    } group-focus-visible:stroke-brand-orange group-focus-visible:stroke-2`}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <path
                    d={hexPath(x, y)}
                    className={`transition-opacity duration-150 ${
                      isHovered ? 'fill-brand-mint/15' : 'fill-transparent'
                    }`}
                  />
                </g>
              )
            })}

            {/* Community pulse — ripples over the fills, under the labels.
               Signature device: the most-active ward breathes. */}
            {(() => {
              const { x, y } = hexCenter(stats.mostActive)
              return (
                <g aria-hidden pointerEvents="none">
                  <circle
                    cx={x}
                    cy={y}
                    r={R + 7}
                    className="stroke-brand-orange/50"
                    strokeWidth="2"
                    fill="none"
                  />
                  {[0, 1, 2].map((i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={R - 30}
                      className="ward-pulse-ring stroke-brand-orange/70"
                      strokeWidth="2"
                      fill="none"
                      style={{ animationDelay: `${i * 0.95}s` }}
                    />
                  ))}
                </g>
              )
            })()}

            {/* Ward labels — count badge, name, descriptor, status chip.
               pointer-events="none": clicks fall through to the fill group
               below, keeping one interactive target per ward. */}
            {blockMap.wards.map((ward) => {
              const isHovered = hoveredId === ward.id
              const isSelected = selectedId === ward.id
              const dominant = dominantStatus(ward)
              const meta = STATUS_META[dominant]
              const Icon = meta.icon
              const { x, y } = hexCenter(ward)
              return (
                <g key={ward.id} pointerEvents="none">
                  {/* Count badge — always top-centre inside the hex */}
                  <circle
                    cx={x}
                    cy={y - 40}
                    r="11"
                    className={`fill-surface ${
                      isSelected ? 'stroke-brand-orange' : 'stroke-ink-400/40'
                    }`}
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={y - 35.5}
                    textAnchor="middle"
                    className="fill-ink-900 font-display text-[12px] font-semibold"
                  >
                    {ward.incidents.length}
                  </text>

                  {/* Typographic tiers: name → descriptor → status */}
                  <text
                    x={x}
                    y={y - 18}
                    textAnchor="middle"
                    className={`font-display text-[17px] font-semibold ${
                      isSelected || isHovered ? 'fill-ink-900' : 'fill-ink-700'
                    }`}
                  >
                    {ward.name}
                  </text>
                  <text
                    x={x}
                    y={y + 2}
                    textAnchor="middle"
                    className="fill-ink-400"
                    fontSize="12"
                  >
                    {ward.sub}
                  </text>

                  {/* Status chip — dot + word + icon, never colour alone */}
                  <g transform={`translate(${x} ${y + 34})`}>
                    <rect
                      x="-46"
                      y="-13"
                      width="92"
                      height="26"
                      rx="13"
                      className={`fill-canvas ${
                        isSelected
                          ? 'stroke-brand-orange/50'
                          : 'stroke-border-subtle'
                      }`}
                      strokeWidth="1"
                    />
                    <Icon
                      x={-38}
                      y={-7.5}
                      width="15"
                      height="15"
                      className="text-ink-700"
                      strokeWidth={1.75}
                    />
                    <circle cx={-16} cy={0} r="3.5" className={meta.dot} />
                    <text
                      x={-8}
                      y="4.5"
                      className="fill-ink-700"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {dominant}
                    </text>
                  </g>
                </g>
              )
            })}

            {/* Shared catchment connector — the ONE explained edge
               (Ward 3 market · Fuleswar depot). Rendered on top of the
               fills so it stays visible across the tangent hexes; the
               legend below explains it. */}
            {catchmentWards.length === 2 && (
              <g aria-hidden pointerEvents="none">
                <path
                  d={`M${hexCenter(catchmentWards[0]).x} ${
                    hexCenter(catchmentWards[0]).y
                  } L${hexCenter(catchmentWards[1]).x} ${
                    hexCenter(catchmentWards[1]).y
                  }`}
                  className="stroke-brand-orange/70"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  fill="none"
                />
                <circle
                  cx={
                    (hexCenter(catchmentWards[0]).x +
                      hexCenter(catchmentWards[1]).x) /
                    2
                  }
                  cy={
                    (hexCenter(catchmentWards[0]).y +
                      hexCenter(catchmentWards[1]).y) /
                    2
                  }
                  r="4"
                  className="fill-brand-orange"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Legend — meaning, not just a colour key */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle pt-4 text-xs text-ink-700">
          {STATUS_ORDER.map((status) => {
            const meta = STATUS_META[status]
            const Icon = meta.icon
            return (
              <span
                key={status}
                title={meta.meaning}
                className="inline-flex items-center gap-1.5"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${meta.dot} text-white`}
                >
                  <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
                </span>
                <span className="max-w-[150px] text-[11px] leading-tight text-ink-400">
                  {meta.meaning}
                </span>
              </span>
            )
          })}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-ink-400/40 bg-surface font-display text-[9px] font-semibold text-ink-900">
              n
            </span>
            Number = total reports in the ward
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-brand-orange/70" />
            Shared ration-depot catchment (Ward 3 · Fuleswar)
          </span>
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
              Select a ward on the map, or use the arrow keys, to drill into
              its cases.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
