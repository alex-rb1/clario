import { useReactFlow, type Edge } from '@xyflow/react'
import type { Block, NodeKind } from '../lib/types'
export default function SelectionPanel({
  nodes,
  edges,
}: {
  nodes: Block[]
  edges: Edge[]
}) {
  const flow = useReactFlow<Block>()
  const node = nodes.filter((n) => n.selected)
  const edge = edges.filter((e) => e.selected)
  if (node.length === 1 && node[0].data.kind !== 'section')
    return (
      <aside className="selection-panel">
        <span className="eyebrow">NODE STYLE</span>
        <select
          aria-label="Node style"
          value={node[0].data.kind}
          onChange={(e) =>
            flow.updateNodeData(node[0].id, {
              kind: e.target.value as NodeKind,
            })
          }
        >
          {[
            'standard',
            'process',
            'decision',
            'input-output',
            'note',
            'code',
          ].map((k) => (
            <option key={k} value={k}>
              {k === 'input-output'
                ? 'Input / Output'
                : k[0].toUpperCase() + k.slice(1)}
            </option>
          ))}
        </select>
        <p>
          Drag the header to move.
          <br />
          Connect using the side dots.
        </p>
      </aside>
    )
  if (edge.length === 1)
    return (
      <aside className="selection-panel">
        <span className="eyebrow">CONNECTION</span>
        <label>
          Label
          <input
            aria-label="Connection label"
            value={String(edge[0].label || '')}
            onChange={(e) =>
              flow.updateEdge(edge[0].id, { label: e.target.value })
            }
          />
        </label>
        {edge[0].label && (
          <>
            <label>
              Label size
              <input
                aria-label="Label size"
                type="range"
                min="10"
                max="36"
                value={Number(edge[0].data?.labelSize ?? 14)}
                onChange={(e) =>
                  flow.updateEdgeData(edge[0].id, {
                    labelSize: Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Label position
              <input
                aria-label="Label position"
                type="range"
                min="0"
                max="100"
                value={Number(edge[0].data?.labelPosition ?? 0.5) * 100}
                onChange={(e) =>
                  flow.updateEdgeData(edge[0].id, {
                    labelPosition: Number(e.target.value) / 100,
                  })
                }
              />
            </label>
            <p>Drag the label along the wire. Drag its corner to resize.</p>
          </>
        )}
        <label>
          Line style
          <select
            aria-label="Connection style"
            value={edge[0].style?.strokeDasharray ? 'dashed' : 'solid'}
            onChange={(e) =>
              flow.updateEdge(edge[0].id, {
                style: {
                  ...edge[0].style,
                  strokeDasharray:
                    e.target.value === 'dashed' ? '6 5' : undefined,
                },
              })
            }
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
          </select>
        </label>
      </aside>
    )
  return null
}
