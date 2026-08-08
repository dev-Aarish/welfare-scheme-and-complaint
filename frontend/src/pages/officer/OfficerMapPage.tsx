import { PageHeader } from '../../components/PageHeader'
import { OfficerBlockMap } from '../../components/OfficerBlockMap'
import { blockMap } from '../../data'
import { useReveal } from '../../hooks/useReveal'

export function OfficerMapPage() {
  const scope = useReveal<HTMLDivElement>()

  return (
    <div>
      <PageHeader
        title="Block map"
        subtitle="Ward-level clusters of every report in the block — select a ward to see its cases."
        count={`${blockMap.wards.length} wards`}
      />

      <div ref={scope} className="mt-6">
        <div data-reveal>
          <OfficerBlockMap />
        </div>
      </div>
    </div>
  )
}
