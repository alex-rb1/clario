import { useCallback, useRef, useState } from 'react'
import type { Diagram } from './types'
function signature(d: Diagram) {
  return JSON.stringify({
    nodes: d.nodes.map((n) => ({
      id: n.id,
      data: n.data,
      position: n.position,
      parentId: n.parentId,
      style: n.style,
    })),
    edges: d.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      style: e.style,
    })),
  })
}
export function useDiagram(initial: Diagram) {
  const [diagram, setDiagram] = useState(initial)
  const current = useRef(diagram),
    past = useRef<Diagram[]>([]),
    future = useRef<Diagram[]>([]),
    merging = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [revision, setRevision] = useState(0)
  const [availability, setAvailability] = useState({
    canUndo: false,
    canRedo: false,
  })
  const endMerge = useCallback(() => {
    merging.current = false
    clearTimeout(timer.current)
  }, [])
  const update = useCallback(
    (
      change: (d: Diagram) => Diagram,
      mode: 'step' | 'merge' | 'silent' = 'step',
    ) => {
      const previous = current.current
      const next = change(previous)
      if (mode !== 'silent' && signature(previous) !== signature(next)) {
        if (mode === 'step' || !merging.current) {
          past.current.push(structuredClone(previous))
          if (past.current.length > 100) past.current.shift()
        }
        future.current = []
        endMerge()
        if (mode === 'merge') {
          merging.current = true
          timer.current = setTimeout(endMerge, 700)
        }
      }
      current.current = next
      setDiagram(next)
      setRevision((r) => r + 1)
      setAvailability({
        canUndo: past.current.length > 0,
        canRedo: future.current.length > 0,
      })
    },
    [endMerge],
  )
  const undo = useCallback(() => {
    endMerge()
    const prev = past.current.pop()
    if (prev) {
      future.current.push(structuredClone(current.current))
      current.current = prev
      setDiagram(prev)
      setRevision((r) => r + 1)
      setAvailability({
        canUndo: past.current.length > 0,
        canRedo: future.current.length > 0,
      })
    }
  }, [endMerge])
  const redo = useCallback(() => {
    endMerge()
    const next = future.current.pop()
    if (next) {
      past.current.push(structuredClone(current.current))
      current.current = next
      setDiagram(next)
      setRevision((r) => r + 1)
      setAvailability({
        canUndo: past.current.length > 0,
        canRedo: future.current.length > 0,
      })
    }
  }, [endMerge])
  return { diagram, update, undo, redo, endMerge, ...availability, revision }
}
