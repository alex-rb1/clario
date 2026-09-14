import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
} from '@xyflow/react'
import { ArrowLeft, Keyboard, Map, Download } from 'lucide-react'
import SelectionPanel from './SelectionPanel'
import BlockNode from './BlockNode'
import { makeNode, type Block, type CanvasDocument } from '../lib/types'
import { useDiagram } from '../lib/useDiagram'
import {
  duplicateSelection,
  groupSelection,
  ungroupSelection,
} from '../lib/operations'
import { readCanvas } from '../lib/storage'
import { useAutosave, downloadDocument } from '../lib/useAutosave'
import Dialog from './Dialog'
import { useCanvasShortcuts } from '../lib/useCanvasShortcuts'
import CanvasToolbar from './CanvasToolbar'
import { useFreehand } from '../lib/useFreehand'
import FreehandPreview from './FreehandPreview'
import RoutedEdge from './RoutedEdge'
const edgeTypes = { default: RoutedEdge }
const nodeTypes = { block: BlockNode }
export default function Canvas({ dark }: { dark: boolean }) {
  const { id } = useParams()
  return <LoadedCanvas key={id} id={id!} dark={dark} />
}
function LoadedCanvas({ id, dark }: { id: string; dark: boolean }) {
  const [loaded] = useState(() => {
    try {
      return { doc: readCanvas(id), error: '' }
    } catch (e) {
      return {
        doc: null,
        error: e instanceof Error ? e.message : 'Unable to read canvas.',
      }
    }
  })
  if (!loaded.doc)
    return (
      <main>
        <h2>{loaded.error || 'Canvas not found'}</h2>
        <p>Your other canvases are available on the dashboard.</p>
        <Link className="primary" to="/">
          Back to canvases
        </Link>
      </main>
    )
  return (
    <ReactFlowProvider>
      <CanvasEditor dark={dark} document={loaded.doc} />
    </ReactFlowProvider>
  )
}
function CanvasEditor({
  dark,
  document: doc,
}: {
  dark: boolean
  document: CanvasDocument
}) {
  const { diagram, update, undo, redo, endMerge, canUndo, canRedo } =
    useDiagram({ nodes: doc.nodes, edges: doc.edges })
  const { nodes, edges } = diagram
  const [name, setName] = useState(doc.name),
    [viewport, setViewport] = useState(doc.viewport)
  const liveDocument = {
    ...doc,
    ...diagram,
    name: name.trim() || 'Untitled canvas',
    viewport,
  }
  const saveError = useAutosave(liveDocument)
  const [minimap, setMinimap] = useState(false),
    [help, setHelp] = useState(false)
  const flow = useReactFlow<Block>()
  const [wireMode, setWireMode] = useState<'auto' | 'freehand'>('auto')
  const freehand = useFreehand(wireMode === 'freehand', (edge) =>
    update((d) => ({
      ...d,
      nodes: d.nodes.map((n) => ({ ...n, selected: false })),
      edges: [...d.edges.map((e) => ({ ...e, selected: false })), edge],
    })),
  )
  const onNodesChange: OnNodesChange<Block> = useCallback(
    (changes) =>
      update(
        (d) => ({ ...d, nodes: applyNodeChanges(changes, d.nodes) }),
        changes.every(
          (c) =>
            c.type === 'select' || (c.type === 'dimensions' && !c.resizing),
        )
          ? 'silent'
          : 'merge',
      ),
    [update],
  )
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      update(
        (d) => ({ ...d, edges: applyEdgeChanges(changes, d.edges) }),
        changes.every((c) => c.type === 'select') ? 'silent' : 'merge',
      ),
    [update],
  )
  const onConnect = useCallback(
    (connection: Connection) =>
      update((d) => ({
        ...d,
        edges: addEdge(
          { ...connection, markerEnd: { type: MarkerType.ArrowClosed } },
          d.edges,
        ),
      })),
    [update],
  )
  const add = useCallback(
    (client?: { x: number; y: number }) => {
      const p = flow.screenToFlowPosition(
        client ?? { x: innerWidth / 2 - 140, y: innerHeight / 2 - 90 },
      )
      update((d) => ({
        ...d,
        nodes: [
          ...d.nodes.map((n) => ({ ...n, selected: false })),
          { ...makeNode(p.x, p.y), selected: true },
        ],
      }))
    },
    [flow, update],
  )
  const duplicate = useCallback(() => {
    if (nodes.some((n) => n.selected)) update(duplicateSelection)
  }, [nodes, update])
  const remove = useCallback(() => {
    endMerge()
    void flow.deleteElements({
      nodes: nodes.filter((n) => n.selected),
      edges: edges.filter((e) => e.selected),
    })
  }, [flow, nodes, edges, endMerge])
  useCanvasShortcuts({ add, duplicate, undo, redo, flow, update, setHelp })
  return (
    <main className="canvas-page">
      <div className="canvas-heading">
        <Link to="/" aria-label="Back to canvases">
          <ArrowLeft size={18} />
        </Link>
        <input
          className="canvas-name"
          aria-label="Canvas name"
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
        />
        <span
          className={saveError ? 'save-error' : 'save-status'}
          role="status"
        >
          {saveError || 'Saved locally'}
        </span>
        <span className="muted">
          Double-click to add · Shift-drag to select
        </span>
        <button
          aria-label="Download backup"
          title="Download canvas backup"
          onClick={() => downloadDocument(liveDocument)}
        >
          <Download size={16} />
        </button>
      </div>
      <div
        className="canvas-workspace"
        onPointerMoveCapture={freehand.move}
        onPointerUpCapture={freehand.up}
        onPointerCancel={freehand.cancel}
        onPointerDownCapture={(e) => {
          if ((e.target as Element).closest('.wire-label')) endMerge()
          freehand.down(e)
        }}
      >
        <CanvasToolbar
          nodes={nodes}
          edges={edges}
          add={add}
          duplicate={duplicate}
          remove={remove}
          undo={undo}
          redo={redo}
          group={() => update(groupSelection)}
          ungroup={() => update(ungroupSelection)}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <div
          className="wire-mode"
          role="group"
          aria-label="Connector drawing mode"
        >
          <button
            aria-pressed={wireMode === 'auto'}
            onClick={() => {
              freehand.cancel()
              setWireMode('auto')
            }}
          >
            Auto connect
          </button>
          <button
            aria-pressed={wireMode === 'freehand'}
            onClick={() => {
              freehand.cancel()
              setWireMode('freehand')
            }}
          >
            Freehand
          </button>
          {wireMode === 'freehand' && (
            <span role="status">
              {freehand.notice ||
                'Draw from a dot to another dot · Esc cancels'}
            </span>
          )}
        </div>
        {freehand.preview && (
          <FreehandPreview
            points={freehand.preview.points}
            target={freehand.preview.target}
          />
        )}
        <div className="canvas-bottom">
          <button
            aria-label="Toggle minimap"
            title="Toggle minimap"
            onClick={() => setMinimap((v) => !v)}
          >
            <Map size={16} />
          </button>
          <button
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts"
            onClick={() => setHelp((v) => !v)}
          >
            <Keyboard size={16} />
          </button>
          <span>
            {nodes.filter((n) => n.data.kind !== 'section').length} nodes ·{' '}
            {edges.length} connections
          </span>
        </div>
        <SelectionPanel nodes={nodes} edges={edges} />
        <ReactFlow
          connectionMode={ConnectionMode.Loose}
          connectionRadius={30}
          fitView={!doc.viewport && doc.nodes.length > 0}
          fitViewOptions={{ padding: 0.22, maxZoom: 1 }}
          defaultViewport={doc.viewport}
          onMoveEnd={(_, v) => setViewport(v)}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={endMerge}
          onSelectionDragStart={endMerge}
          colorMode={dark ? 'dark' : 'light'}
          onDoubleClick={(e) => {
            if (
              (e.target as HTMLElement).classList.contains('react-flow__pane')
            )
              add({ x: e.clientX, y: e.clientY })
          }}
          zoomOnDoubleClick={false}
          minZoom={0.15}
          maxZoom={2.5}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Meta', 'Control']}
        >
          <Background gap={24} />
          <Controls />
          {minimap && (
            <MiniMap
              pannable
              zoomable
              nodeColor={dark ? '#55654e' : '#bccbac'}
              maskColor={dark ? '#141716b0' : '#f6f7f2b0'}
            />
          )}
        </ReactFlow>
        {nodes.length === 0 && (
          <div className="canvas-empty">
            <span>Every idea starts somewhere.</span>
            <p>Double-click anywhere to add your first node.</p>
          </div>
        )}
        {help && (
          <Dialog title="Stay in the flow" onClose={() => setHelp(false)}>
            <p>Use ⌘ on Mac, Ctrl on Windows.</p>
            <dl>
              {[
                ['N', 'New node'],
                ['⌘/Ctrl D', 'Duplicate'],
                ['Delete / Backspace', 'Delete selection'],
                ['⌘/Ctrl Z', 'Undo'],
                ['⌘/Ctrl Shift Z', 'Redo'],
                ['⌘/Ctrl A', 'Select all'],
                ['⌘/Ctrl G', 'Group selection'],
                ['⌘/Ctrl Shift G', 'Ungroup'],
                ['+ / −', 'Zoom'],
                ['0', 'Fit diagram'],
                ['Shift + drag', 'Select an area'],
                ['/ while editing', 'Insert content'],
              ].map(([key, text]) => (
                <div key={key}>
                  <dt>{text}</dt>
                  <dd>
                    <kbd>{key}</kbd>
                  </dd>
                </div>
              ))}
            </dl>
            <button
              className="primary"
              autoFocus
              onClick={() => setHelp(false)}
            >
              Got it
            </button>
          </Dialog>
        )}
      </div>
    </main>
  )
}
