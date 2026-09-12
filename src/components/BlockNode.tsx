import { useState } from 'react'
import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type NodeProps,
} from '@xyflow/react'
import type { Block } from '../lib/types'
import CodeEditor from './CodeEditor'
import RichEditor from './RichEditor'
export default function BlockNode({ id, data, selected }: NodeProps<Block>) {
  const flow = useReactFlow<Block>()
  const [editing, setEditing] = useState(false)
  const [wasSelected, setWasSelected] = useState(selected)
  if (selected !== wasSelected) {
    setWasSelected(selected)
    if (!selected) setEditing(false)
  }
  const active = !!selected && editing
  const startEditing = () => {
    flow.setNodes((nodes) =>
      nodes.map((node) => ({ ...node, selected: node.id === id })),
    )
    setEditing(true)
  }
  if (data.kind === 'section')
    return (
      <div className="block kind-section">
        <NodeResizer isVisible={selected} minWidth={300} minHeight={200} />
        <div className="block-title">
          <span>SECTION</span>
          <input
            className="nodrag"
            aria-label="Section name"
            value={data.title}
            onChange={(e) => flow.updateNodeData(id, { title: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    )
  return (
    <div
      className={`block kind-${data.kind} ${active ? 'is-editing' : 'is-reading'}`}
    >
      <NodeResizer isVisible={selected} minWidth={220} minHeight={140} />
      <Handle type="target" position={Position.Left} />
      <div className="block-title" onDoubleClick={startEditing}>
        <input
          className={active ? 'nodrag' : 'read-title'}
          readOnly={!active}
          aria-label="Node title"
          value={data.title}
          onChange={(e) => flow.updateNodeData(id, { title: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
        />
        <button
          className="nodrag edit-button"
          aria-label={
            active
              ? data.kind === 'code'
                ? 'Finish editing'
                : 'Stop editing node'
              : 'Edit node'
          }
          onClick={() => (active ? setEditing(false) : startEditing())}
        >
          {active ? 'Done' : 'Edit'}
        </button>
      </div>
      <div className="block-content" onDoubleClick={startEditing}>
        {data.kind === 'code' ? (
          <CodeEditor
            code={data.code}
            language={data.language}
            active={active}
            onChange={(patch) => flow.updateNodeData(id, patch)}
          />
        ) : (
          <RichEditor
            onDone={() => setEditing(false)}
            content={data.content}
            active={active}
            onChange={(content) => flow.updateNodeData(id, { content })}
          />
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
