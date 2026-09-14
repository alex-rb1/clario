import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useReactFlow, type Edge } from '@xyflow/react'
import type { Block } from './types'
import type { Point } from './routing'
type Port = Point & { node: string; handle: string }
type Draft = { source: Port; points: Point[]; target: Port | null }
export function useFreehand(enabled: boolean, commit: (edge: Edge) => void) {
  const flow = useReactFlow<Block>()
  const draft = useRef<Draft | null>(null)
  const [preview, setPreview] = useState<Draft | null>(null)
  const [notice, setNotice] = useState('')
  const ports = (): Port[] =>
    flow
      .getNodes()
      .filter((n) => n.data.kind !== 'section')
      .flatMap((n) => {
        const internal = flow.getInternalNode(n.id)
        const p = internal?.internals.positionAbsolute ?? n.position,
          w = n.measured?.width ?? Number(n.style?.width ?? 280),
          h = n.measured?.height ?? Number(n.style?.height ?? 180)
        return [
          { node: n.id, handle: 'left', x: p.x, y: p.y + h / 2 },
          { node: n.id, handle: 'right', x: p.x + w, y: p.y + h / 2 },
          { node: n.id, handle: 'top', x: p.x + w / 2, y: p.y },
          { node: n.id, handle: 'bottom', x: p.x + w / 2, y: p.y + h },
        ]
      })
  const cancel = () => {
    draft.current = null
    setPreview(null)
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        draft.current = null
        setPreview(null)
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled || e.button !== 0) return
    const handle = (e.target as Element).closest('.react-flow__handle')
    if (!handle) return
    const node = handle.getAttribute('data-nodeid'),
      side = ['left', 'right', 'top', 'bottom'].find((side) =>
        handle.classList.contains(`react-flow__handle-${side}`),
      )
    const source = ports().find((p) => p.node === node && p.handle === side)
    if (!source) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    draft.current = {
      source,
      points: [{ x: source.x, y: source.y }],
      target: null,
    }
    setPreview(draft.current)
    setNotice('')
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = draft.current
    if (!d) return
    e.preventDefault()
    e.stopPropagation()
    const p = flow.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const last = d.points.at(-1)!
    const candidates = ports()
      .filter((port) => port.node !== d.source.node)
      .map((port) => ({
        port,
        distance: Math.hypot(port.x - p.x, port.y - p.y),
      }))
      .sort((a, b) => a.distance - b.distance)
    const target =
      candidates[0]?.distance < 30 / flow.getZoom() ? candidates[0].port : null
    let points = d.points
    if (Math.hypot(p.x - last.x, p.y - last.y) > 3 / flow.getZoom())
      points = [...points, p]
    if (points.length > 600) points = points.filter((_, i) => i % 2 === 0)
    draft.current = { ...d, points, target }
    setPreview(draft.current)
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (!draft.current) return
    move(e)
    const d = draft.current!
    e.stopPropagation()
    e.preventDefault()
    if (d.target) {
      const points = [...d.points, { x: d.target.x, y: d.target.y }]
      commit({
        id: crypto.randomUUID(),
        source: d.source.node,
        target: d.target.node,
        sourceHandle: d.source.handle,
        targetHandle: d.target.handle,
        data: {
          routing: 'freehand',
          freehand: {
            points,
            source: { x: d.source.x, y: d.source.y },
            target: { x: d.target.x, y: d.target.y },
          },
        },
        selected: true,
      })
      setNotice('')
    } else setNotice('Release near a connector dot to attach the wire.')
    cancel()
  }
  return { preview, notice, down, move, up, cancel }
}
