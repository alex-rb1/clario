import type { CanvasDocument, Diagram } from './types'
const PREFIX = 'clario:canvas:'
function validate(value: unknown): value is CanvasDocument {
  if (!value || typeof value !== 'object') return false
  const d = value as CanvasDocument
  return (
    typeof d.id === 'string' &&
    typeof d.name === 'string' &&
    typeof d.updatedAt === 'number' &&
    Array.isArray(d.nodes) &&
    Array.isArray(d.edges) &&
    d.nodes.every(
      (n) =>
        typeof n.id === 'string' &&
        n.type === 'block' &&
        Number.isFinite(n.position?.x) &&
        Number.isFinite(n.position?.y) &&
        typeof n.data?.content === 'string' &&
        typeof n.data?.title === 'string' &&
        typeof n.data?.code === 'string' &&
        typeof n.data?.language === 'string' &&
        [
          'standard',
          'process',
          'decision',
          'input-output',
          'note',
          'code',
          'section',
        ].includes(n.data.kind),
    ) &&
    d.edges.every(
      (e) =>
        typeof e.id === 'string' &&
        typeof e.source === 'string' &&
        typeof e.target === 'string',
    )
  )
}
export function readCanvas(id: string): CanvasDocument | null {
  const raw = localStorage.getItem(PREFIX + id)
  if (!raw) return null
  let record
  try {
    record = JSON.parse(raw)
  } catch {
    throw Error(
      'This canvas could not be read. Its saved data has been left untouched.',
    )
  }
  if (record?.version !== 1 || !validate(record.document))
    throw Error(
      'This canvas could not be read. Its saved data has been left untouched.',
    )
  return {
    ...record.document,
    edges: record.document.edges.map(
      (edge: CanvasDocument['edges'][number]) => ({
        ...edge,
        sourceHandle: edge.sourceHandle ?? 'right',
        targetHandle: edge.targetHandle ?? 'left',
      }),
    ),
  }
}
export function saveCanvas(doc: CanvasDocument) {
  localStorage.setItem(
    PREFIX + doc.id,
    JSON.stringify({ version: 1, document: doc }),
  )
}
export function createCanvas(
  name = 'Untitled canvas',
  diagram: Diagram = { nodes: [], edges: [] },
): CanvasDocument {
  const doc = {
    ...diagram,
    id: crypto.randomUUID(),
    name,
    updatedAt: Date.now(),
  }
  saveCanvas(doc)
  return doc
}
export function listCanvases(): {
  documents: CanvasDocument[]
  unreadable: number
} {
  const documents: CanvasDocument[] = []
  let unreadable = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) {
      try {
        const doc = readCanvas(key.slice(PREFIX.length))
        if (doc) documents.push(doc)
      } catch {
        unreadable++
      }
    }
  }
  return {
    documents: documents.sort((a, b) => b.updatedAt - a.updatedAt),
    unreadable,
  }
}
export function deleteCanvas(id: string) {
  localStorage.removeItem(PREFIX + id)
}
export function renameCanvas(id: string, name: string) {
  const doc = readCanvas(id)
  if (!doc) throw Error('Canvas no longer exists.')
  saveCanvas({
    ...doc,
    name: name.trim() || 'Untitled canvas',
    updatedAt: Date.now(),
  })
}

export function importCanvas(raw: string): CanvasDocument {
  let record
  try {
    record = JSON.parse(raw)
  } catch {
    throw Error('Choose a valid Clario JSON backup.')
  }
  if (record?.version !== 1 || !validate(record.document))
    throw Error('This file is not a supported Clario backup.')
  const original = record.document as CanvasDocument
  const ids = new Set(original.nodes.map((n) => n.id))
  if (
    ids.size !== original.nodes.length ||
    original.edges.some((e) => !ids.has(e.source) || !ids.has(e.target))
  )
    throw Error('This backup has invalid node connections.')
  const seen = new Set<string>()
  for (const n of original.nodes) {
    if (n.parentId && !seen.has(n.parentId))
      throw Error('This backup has invalid sections.')
    seen.add(n.id)
  }
  const doc: CanvasDocument = {
    ...original,
    id: crypto.randomUUID(),
    name: original.name + ' (imported)',
    updatedAt: Date.now(),
    nodes: original.nodes.map((n) => ({ ...n, selected: false })),
    edges: original.edges.map((e) => ({ ...e, selected: false })),
  }
  saveCanvas(doc)
  return doc
}
