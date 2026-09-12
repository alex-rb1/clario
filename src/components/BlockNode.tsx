import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react'
import type { Block } from '../lib/types'
export default function BlockNode({ data, selected }: NodeProps<Block>) {
 return <div className={`block kind-${data.kind}`}><NodeResizer isVisible={selected} minWidth={220} minHeight={140}/><Handle type="target" position={Position.Left}/><div className="block-title">{data.title}</div><div className="block-body">Write an idea…</div><Handle type="source" position={Position.Right}/></div>
}
