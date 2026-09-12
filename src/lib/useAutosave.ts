import { useEffect, useRef, useState } from 'react'
import type { CanvasDocument } from './types'
import { saveCanvas } from './storage'
export function cleanDocument(doc: CanvasDocument): CanvasDocument {
  return {
    ...doc,
    nodes: doc.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
      style: n.style,
      parentId: n.parentId,
      zIndex: n.zIndex,
    })),
    edges: doc.edges.map((e) => ({ ...e, selected: false })),
  }
}
export function useAutosave(doc: CanvasDocument) {
  const [error, setError] = useState('')
  const lastSaved = useRef('')
  useEffect(() => {
    const clean = cleanDocument(doc)
    const signature = JSON.stringify({ ...clean, updatedAt: 0 })
    if (signature === lastSaved.current) return
    try {
      saveCanvas({ ...clean, updatedAt: Date.now() })
      lastSaved.current = signature
      // Storage synchronization results are reflected in the visible save status.
      // eslint-disable-next-line react/set-state-in-effect
      setError('')
    } catch {
      setError(
        'Not saved — browser storage is full or unavailable. Download a backup before closing.',
      )
    }
  }, [doc])
  return error
}
export function downloadDocument(doc: CanvasDocument) {
  const url = URL.createObjectURL(
    new Blob(
      [JSON.stringify({ version: 1, document: cleanDocument(doc) }, null, 2)],
      { type: 'application/json' },
    ),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.name.replace(/[^a-z0-9_-]/gi, '-') || 'clario'}.clario.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
