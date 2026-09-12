import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, MarkerType, ReactFlow, ReactFlowProvider, useReactFlow, type OnNodesChange, type OnEdgesChange, type Connection, type Edge } from '@xyflow/react'
import { ArrowLeft, Copy, Plus, Trash2 } from 'lucide-react'
import BlockNode from './BlockNode'
import { makeNode, type Block } from '../lib/types'
const nodeTypes = { block: BlockNode }
export default function Canvas({ dark }: { dark: boolean }) { return <ReactFlowProvider><CanvasEditor dark={dark}/></ReactFlowProvider> }
function CanvasEditor({ dark }: { dark: boolean }) {
 const [nodes,setNodes] = useState<Block[]>([])
 const [edges,setEdges] = useState<Edge[]>([])
 const flow = useReactFlow<Block>()
 const onNodesChange: OnNodesChange<Block> = useCallback(changes=>setNodes(current=>applyNodeChanges(changes,current)),[])
 const onEdgesChange: OnEdgesChange = useCallback(changes=>setEdges(current=>applyEdgeChanges(changes,current)),[])
 const onConnect = useCallback((connection: Connection)=>setEdges(current=>addEdge({...connection,markerEnd:{type:MarkerType.ArrowClosed}},current)),[])
 const add = (client?: {x:number;y:number}) => {const p=flow.screenToFlowPosition(client ?? {x:innerWidth/2,y:innerHeight/2});setNodes(ns=>[...ns.map(n=>({...n,selected:false})),{...makeNode(p.x,p.y),selected:true}])}
 const duplicate = () => setNodes(ns=>[...ns.map(n=>({...n,selected:false})),...ns.filter(n=>n.selected).map(n=>({...structuredClone(n),id:crypto.randomUUID(),position:{x:n.position.x+40,y:n.position.y+40},selected:true}))])
 return <div className="canvas-page"><div className="canvas-heading"><Link to="/" aria-label="Back to canvases"><ArrowLeft size={18}/></Link><strong>Untitled canvas</strong><span className="muted">Double-click to add a node · Shift-drag to select</span></div><div className="canvas-workspace"><div className="canvas-tools"><button className="primary" onClick={()=>add()}><Plus size={17}/>Add node</button><button title="Duplicate selected" aria-label="Duplicate selected" onClick={duplicate}><Copy size={17}/></button><button title="Delete selected" aria-label="Delete selected" onClick={()=>void flow.deleteElements({nodes:nodes.filter(n=>n.selected),edges:edges.filter(e=>e.selected)})}><Trash2 size={17}/></button></div><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} colorMode={dark?'dark':'light'} onDoubleClick={e=>{if((e.target as HTMLElement).classList.contains('react-flow__pane'))add({x:e.clientX,y:e.clientY})}} zoomOnDoubleClick={false} minZoom={0.15} maxZoom={2.5} deleteKeyCode={['Backspace','Delete']} multiSelectionKeyCode={['Meta','Control']}><Background gap={24}/><Controls/></ReactFlow>{nodes.length===0&&<div className="canvas-empty"><span>Every idea starts somewhere.</span><p>Double-click anywhere to add your first node.</p></div>}</div></div>
}
