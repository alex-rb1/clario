import { useEffect, type Dispatch, type SetStateAction } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { Block } from './types'
import { useDiagram } from './useDiagram'
import { groupSelection, ungroupSelection } from './operations'
type Options = {
  add: () => void
  duplicate: () => void
  undo: () => void
  redo: () => void
  flow: ReturnType<typeof useReactFlow<Block>>
  update: ReturnType<typeof useDiagram>['update']
  setHelp: Dispatch<SetStateAction<boolean>>
}
export function useCanvasShortcuts({
  add,
  duplicate,
  undo,
  redo,
  flow,
  update,
  setHelp,
}: Options) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.closest('input,textarea,select,dialog,[contenteditable="true"]')
      )
        return
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        duplicate()
      } else if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        update(
          (d) => ({
            ...d,
            nodes: d.nodes.map((n) => ({ ...n, selected: true })),
          }),
          'silent',
        )
      } else if (mod && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        update(e.shiftKey ? ungroupSelection : groupSelection)
      } else if (e.key.toLowerCase() === 'n' && !mod && !e.altKey) {
        e.preventDefault()
        add()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        void flow.zoomIn()
      } else if (e.key === '-') {
        e.preventDefault()
        void flow.zoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        void flow.fitView({ padding: 0.2 })
      } else if (e.key === '?') {
        setHelp((h) => !h)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [add, duplicate, flow, undo, redo, update, setHelp])
}
