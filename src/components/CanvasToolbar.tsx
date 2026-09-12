import { Copy, Plus, Trash2, Undo2, Redo2, Group, Ungroup } from 'lucide-react'
import type { Diagram } from '../lib/types'
type Props = Diagram & {
  add: () => void
  duplicate: () => void
  remove: () => void
  undo: () => void
  redo: () => void
  group: () => void
  ungroup: () => void
  canUndo: boolean
  canRedo: boolean
}
export default function CanvasToolbar({
  nodes,
  edges,
  add,
  duplicate,
  remove,
  undo,
  redo,
  group,
  ungroup,
  canUndo,
  canRedo,
}: Props) {
  return (
    <div className="canvas-tools">
      <button className="primary" aria-label="Add node" onClick={() => add()}>
        <Plus size={17} />
        <span>Add node</span>
      </button>
      <button
        title="Duplicate selected (⌘/Ctrl D)"
        aria-label="Duplicate selected"
        onClick={duplicate}
        disabled={!nodes.some((n) => n.selected)}
      >
        <Copy size={17} />
      </button>
      <button
        title="Delete selected"
        aria-label="Delete selected"
        onClick={remove}
        disabled={
          !nodes.some((n) => n.selected) && !edges.some((e) => e.selected)
        }
      >
        <Trash2 size={17} />
      </button>
      <i className="tool-divider" />
      <button
        title="Undo (⌘/Ctrl Z)"
        aria-label="Undo"
        onClick={undo}
        disabled={!canUndo}
      >
        <Undo2 size={17} />
      </button>
      <button
        title="Redo (⌘/Ctrl Shift Z)"
        aria-label="Redo"
        onClick={redo}
        disabled={!canRedo}
      >
        <Redo2 size={17} />
      </button>
      <i className="tool-divider" />
      <button
        title="Group selected (⌘/Ctrl G)"
        aria-label="Group selected"
        onClick={group}
        disabled={
          !nodes.some(
            (n) => n.selected && !n.parentId && n.data.kind !== 'section',
          )
        }
      >
        <Group size={17} />
      </button>
      <button
        title="Ungroup selected"
        aria-label="Ungroup selected"
        onClick={ungroup}
        disabled={!nodes.some((n) => n.selected && n.data.kind === 'section')}
      >
        <Ungroup size={17} />
      </button>
    </div>
  )
}
