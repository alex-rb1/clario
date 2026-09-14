import { useViewport } from '@xyflow/react'
import type { Point } from '../lib/routing'
export default function FreehandPreview({
  points,
  target,
}: {
  points: Point[]
  target: Point | null
}) {
  const viewport = useViewport()
  const all = target ? [...points, target] : points
  return (
    <svg className="freehand-preview" aria-hidden="true">
      <g
        transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}
      >
        <path
          d={all.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')}
          fill="none"
          stroke="var(--wire-color)"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {target && (
          <circle
            cx={target.x}
            cy={target.y}
            r={12 / viewport.zoom}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2 / viewport.zoom}
          />
        )}
      </g>
    </svg>
  )
}
