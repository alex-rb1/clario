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
  const active = !!selected && editing
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
    <div className={`block kind-${data.kind}`}>
      <NodeResizer isVisible={selected} minWidth={220} minHeight={140} />
      <Handle type="target" position={Position.Left} />
      <div className="block-title">
        <input
          className="nodrag"
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
          onClick={() => setEditing(!active)}
        >
          {active ? 'Done' : 'Edit'}
        </button>
      </div>
      <div className="block-content" onDoubleClick={() => setEditing(true)}>
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
