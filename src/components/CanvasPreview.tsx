import type { CanvasDocument, Block } from '../lib/types'
export default function CanvasPreview({
  document: doc,
}: {
  document: CanvasDocument
}) {
  const position = (n: Block, depth = 0): { x: number; y: number } => {
    const p = doc.nodes.find((g) => g.id === n.parentId)
    if (!p || depth > 10) return n.position
    const a = position(p, depth + 1)
    return { x: a.x + n.position.x, y: a.y + n.position.y }
  }
  const blocks = doc.nodes.map((n) => ({
    ...n,
    p: position(n),
    w: Number(n.style?.width ?? 280),
    h: Number(n.style?.height ?? 180),
  }))
  if (!blocks.length)
    return (
      <div className="mini-diagram">
        <i />
        <b />
        <i />
        <b />
        <i />
      </div>
    )
  const x = Math.min(...blocks.map((n) => n.p.x)) - 50,
    y = Math.min(...blocks.map((n) => n.p.y)) - 50
  const w = Math.max(...blocks.map((n) => n.p.x + n.w)) - x + 50,
    h = Math.max(...blocks.map((n) => n.p.y + n.h)) - y + 50
  return (
    <svg
      className="canvas-preview"
      viewBox={`${x} ${y} ${w} ${h}`}
      aria-hidden="true"
    >
      {doc.edges.map((e) => {
        const a = blocks.find((n) => n.id === e.source),
          b = blocks.find((n) => n.id === e.target)
        return a && b ? (
          <line
            key={e.id}
            x1={a.p.x + a.w}
            y1={a.p.y + a.h / 2}
            x2={b.p.x}
            y2={b.p.y + b.h / 2}
            stroke="var(--muted)"
            strokeWidth="3"
          />
        ) : null
      })}
      {blocks.map((n) => (
        <g key={n.id}>
          <rect
            x={n.p.x}
            y={n.p.y}
            width={n.w}
            height={n.h}
            rx={12}
            fill={n.data.kind === 'section' ? 'transparent' : 'var(--panel)'}
            stroke={
              n.data.kind === 'code'
                ? '#9ba4ed'
                : n.data.kind === 'decision'
                  ? '#d4a0ef'
                  : 'var(--muted)'
            }
            strokeWidth={2}
          />
          {n.data.kind !== 'section' && (
            <>
              <line
                x1={n.p.x + 18}
                y1={n.p.y + 30}
                x2={n.p.x + Math.min(n.w - 20, 130)}
                y2={n.p.y + 30}
                stroke="var(--accent)"
                strokeWidth="7"
              />
              {[62, 84, 106]
                .filter((v) => v < n.h - 15)
                .map((v) => (
                  <line
                    key={v}
                    x1={n.p.x + 18}
                    y1={n.p.y + v}
                    x2={n.p.x + n.w - 30 - (v % 3) * 15}
                    y2={n.p.y + v}
                    stroke="var(--line)"
                    strokeWidth="6"
                  />
                ))}
            </>
          )}
        </g>
      ))}
    </svg>
  )
}
