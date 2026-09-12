import { makeNode, type Block, type Diagram } from './types'
export function duplicateSelection(d: Diagram): Diagram {
  const ids = new Set(d.nodes.filter((n) => n.selected).map((n) => n.id))
  let changed = true
  while (changed) {
    changed = false
    for (const n of d.nodes)
      if (n.parentId && ids.has(n.parentId) && !ids.has(n.id)) {
        ids.add(n.id)
        changed = true
      }
  }
  const mapped = new Map([...ids].map((id) => [id, crypto.randomUUID()]))
  const clones = d.nodes
    .filter((n) => ids.has(n.id))
    .map((n) => ({
      ...structuredClone(n),
      id: mapped.get(n.id)!,
      parentId:
        n.parentId && mapped.has(n.parentId)
          ? mapped.get(n.parentId)
          : n.parentId,
      position: {
        x: n.position.x + (n.parentId && ids.has(n.parentId) ? 0 : 40),
        y: n.position.y + (n.parentId && ids.has(n.parentId) ? 0 : 40),
      },
      selected: true,
    }))
  return {
    nodes: [...d.nodes.map((n) => ({ ...n, selected: false })), ...clones],
    edges: [
      ...d.edges.map((e) => ({ ...e, selected: false })),
      ...d.edges
        .filter((e) => ids.has(e.source) && ids.has(e.target))
        .map((e) => ({
          ...structuredClone(e),
          id: crypto.randomUUID(),
          source: mapped.get(e.source)!,
          target: mapped.get(e.target)!,
          selected: false,
        })),
    ],
  }
}
export function groupSelection(d: Diagram): Diagram {
  const selected = d.nodes.filter(
    (n) => n.selected && !n.parentId && n.data.kind !== 'section',
  )
  if (!selected.length) return d
  const x = Math.min(...selected.map((n) => n.position.x)) - 35,
    y = Math.min(...selected.map((n) => n.position.y)) - 65
  const right = Math.max(
      ...selected.map(
        (n) =>
          n.position.x + (n.measured?.width ?? Number(n.style?.width ?? 280)),
      ),
    ),
    bottom = Math.max(
      ...selected.map(
        (n) =>
          n.position.y + (n.measured?.height ?? Number(n.style?.height ?? 180)),
      ),
    )
  const group: Block = {
    ...makeNode(x, y, 'section'),
    style: { width: right - x + 35, height: bottom - y + 35 },
    selected: true,
    zIndex: -1,
  }
  const ids = new Set(selected.map((n) => n.id))
  return {
    ...d,
    nodes: [
      group,
      ...d.nodes.map((n) =>
        ids.has(n.id)
          ? {
              ...n,
              parentId: group.id,
              position: { x: n.position.x - x, y: n.position.y - y },
              selected: false,
            }
          : n,
      ),
    ],
  }
}
export function ungroupSelection(d: Diagram): Diagram {
  const groups = d.nodes.filter((n) => n.selected && n.data.kind === 'section')
  const map = new Map(groups.map((g) => [g.id, g]))
  if (!groups.length) return d
  return {
    ...d,
    nodes: d.nodes
      .filter((n) => !map.has(n.id))
      .map((n) => {
        const parent = n.parentId ? map.get(n.parentId) : undefined
        return parent
          ? {
              ...n,
              parentId: parent.parentId,
              position: {
                x: n.position.x + parent.position.x,
                y: n.position.y + parent.position.y,
              },
              selected: true,
            }
          : n
      }),
    edges: d.edges.filter((e) => !map.has(e.source) && !map.has(e.target)),
  }
}
