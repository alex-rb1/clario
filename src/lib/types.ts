import type { Edge, Node, Viewport } from '@xyflow/react'
export type NodeKind =
  | 'standard'
  | 'process'
  | 'decision'
  | 'input-output'
  | 'note'
  | 'code'
  | 'section'
export type BlockData = {
  title: string
  content: string
  kind: NodeKind
  language: string
  code: string
}
export type Block = Node<BlockData, 'block'>
export type Diagram = { nodes: Block[]; edges: Edge[] }
export type CanvasDocument = Diagram & {
  id: string
  name: string
  updatedAt: number
  viewport?: Viewport
}
export function makeNode(
  x: number,
  y: number,
  kind: NodeKind = 'standard',
): Block {
  return {
    id: crypto.randomUUID(),
    type: 'block',
    position: { x, y },
    data: {
      title: kind === 'section' ? 'New section' : 'Untitled',
      content: '<p>Write an idea…</p>',
      kind,
      language: 'typescript',
      code: '// Start writing code\n',
    },
    style: {
      width: kind === 'section' ? 600 : 280,
      height: kind === 'section' ? 400 : 180,
    },
  }
}
