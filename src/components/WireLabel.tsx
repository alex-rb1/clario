import { useMemo, useRef, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
export default function WireLabel({
  id,
  path,
  label,
  data,
  selected,
}: {
  id: string
  path: string
  label: string
  data: Record<string, unknown>
  selected?: boolean
}) {
  const flow = useReactFlow()
  const [preview, setPreview] = useState<{ t: number; size: number } | null>(
    null,
  )
  const drag = useRef<{
    mode: 'move' | 'resize'
    x: number
    size: number
    t: number
  } | null>(null)
  const t = preview?.t ?? Number(data.labelPosition ?? 0.5),
    size = preview?.size ?? Number(data.labelSize ?? 14)
  const geometry = useMemo(() => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p.setAttribute('d', path)
    return { p, length: p.getTotalLength() }
  }, [path])
  const point = geometry.p.getPointAtLength(geometry.length * t),
    width = Math.max(40, label.length * size * 0.6 + 20),
    height = size + 16
  const start = (
    e: React.PointerEvent<SVGGElement | SVGRectElement>,
    mode: 'move' | 'resize',
  ) => {
    e.stopPropagation()
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { mode, x: e.clientX, size, t }
    flow.setEdges((es) =>
      es.map((edge) => ({ ...edge, selected: edge.id === id })),
    )
  }
  const move = (e: React.PointerEvent) => {
    if (!drag.current) return
    e.stopPropagation()
    if (drag.current.mode === 'resize') {
      const size = Math.max(
        10,
        Math.min(
          36,
          drag.current.size + (e.clientX - drag.current.x) / flow.getZoom() / 4,
        ),
      )
      setPreview({ t: drag.current.t, size })
      return
    }
    const mouse = flow.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    let closest = 0,
      distance = Infinity
    for (let i = 0; i <= 200; i++) {
      const p = geometry.p.getPointAtLength((geometry.length * i) / 200),
        d = Math.hypot(p.x - mouse.x, p.y - mouse.y)
      if (d < distance) {
        closest = i / 200
        distance = d
      }
    }
    setPreview({ t: closest, size })
  }
  const finish = (e: React.PointerEvent) => {
    if (!drag.current) return
    e.stopPropagation()
    const final = preview ?? { t, size }
    flow.updateEdgeData(id, { labelPosition: final.t, labelSize: final.size })
    drag.current = null
    setPreview(null)
  }
  return (
    <g
      className="wire-label nodrag nopan"
      transform={`translate(${point.x},${point.y})`}
      onPointerDown={(e) => start(e, 'move')}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={() => {
        drag.current = null
        setPreview(null)
      }}
      style={{ pointerEvents: 'all', cursor: 'grab' }}
    >
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={6}
        className="wire-label-bg"
      />
      <text
        className="react-flow__edge-text"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: size, userSelect: 'none' }}
      >
        {label}
      </text>
      {selected && (
        <rect
          aria-label="Resize connection label"
          className="wire-label-resize"
          x={width / 2 - 5}
          y={height / 2 - 5}
          width={10}
          height={10}
          rx={2}
          onPointerDown={(e) => start(e, 'resize')}
          style={{ cursor: 'nwse-resize' }}
        />
      )}
    </g>
  )
}
