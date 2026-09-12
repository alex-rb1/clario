import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, MarkerType, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow, type OnNodesChange, type OnEdgesChange, type Connection } from '@xyflow/react'
import { ArrowLeft, Copy, Plus, Trash2, Undo2, Redo2, Group, Ungroup, Keyboard, Map } from 'lucide-react'
import SelectionPanel from './SelectionPanel'
import BlockNode from './BlockNode'
import { makeNode, type Block, type CanvasDocument } from '../lib/types'
import { useDiagram } from '../lib/useDiagram'
import { duplicateSelection, groupSelection, ungroupSelection } from '../lib/operations'
import { readCanvas, saveCanvas } from '../lib/storage'
const nodeTypes = { block: BlockNode }
export default function Canvas({ dark }: { dark: boolean }) {
 const {id}=useParams();return <LoadedCanvas key={id} id={id!} dark={dark}/>
}
function LoadedCanvas({id,dark}:{id:string;dark:boolean}) {
 const [loaded]=useState(()=>{try{return {doc:readCanvas(id),error:''}}catch(e){return {doc:null,error:e instanceof Error?e.message:'Unable to read canvas.'}}})
 if(!loaded.doc)return <main><h2>{loaded.error||'Canvas not found'}</h2><p>Your other canvases are available on the dashboard.</p><Link className="primary" to="/">Back to canvases</Link></main>
 return <ReactFlowProvider><CanvasEditor dark={dark} document={loaded.doc}/></ReactFlowProvider>
}
function CanvasEditor({ dark, document:doc }: { dark: boolean; document:CanvasDocument }) {
 const {diagram,update,undo,redo,endMerge,canUndo,canRedo}=useDiagram({nodes:doc.nodes,edges:doc.edges})
 const {nodes,edges}=diagram
 const [name,setName]=useState(doc.name),[viewport,setViewport]=useState(doc.viewport),[saveError,setSaveError]=useState('')
 // Saving synchronizes with browser storage; the result drives the visible save status.
 // eslint-disable-next-line react/set-state-in-effect
 useEffect(()=>{try{saveCanvas({...doc,...diagram,name:name.trim()||'Untitled canvas',viewport,updatedAt:Date.now()});setSaveError('')}catch{setSaveError('Not saved — browser storage is full or unavailable. Keep this tab open.')}},[diagram,name,viewport,doc])
 const [minimap,setMinimap]=useState(false),[help,setHelp]=useState(false)
 const flow = useReactFlow<Block>()
 const onNodesChange: OnNodesChange<Block> = useCallback(changes=>update(d=>({...d,nodes:applyNodeChanges(changes,d.nodes)}),changes.every(c=>c.type==='select'||(c.type==='dimensions'&&!c.resizing))?'silent':'merge'),[update])
 const onEdgesChange: OnEdgesChange = useCallback(changes=>update(d=>({...d,edges:applyEdgeChanges(changes,d.edges)}),changes.every(c=>c.type==='select')?'silent':'merge'),[update])
 const onConnect = useCallback((connection: Connection)=>update(d=>({...d,edges:addEdge({...connection,markerEnd:{type:MarkerType.ArrowClosed}},d.edges)})),[update])
 const add = useCallback((client?: {x:number;y:number}) => {const p=flow.screenToFlowPosition(client ?? {x:innerWidth/2-140,y:innerHeight/2-90});update(d=>({...d,nodes:[...d.nodes.map(n=>({...n,selected:false})),{...makeNode(p.x,p.y),selected:true}]}))},[flow,update])
 const duplicate=useCallback(()=>{if(nodes.some(n=>n.selected))update(duplicateSelection)},[nodes,update])
 const remove=useCallback(()=>{endMerge();void flow.deleteElements({nodes:nodes.filter(n=>n.selected),edges:edges.filter(e=>e.selected)})},[flow,nodes,edges,endMerge])
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{
  const target=e.target as HTMLElement;if(target.closest('input,textarea,select,[contenteditable="true"]'))return
  const mod=e.metaKey||e.ctrlKey
  if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo()}
  else if(mod&&e.key.toLowerCase()==='y'){e.preventDefault();redo()}
  else if(mod&&e.key.toLowerCase()==='d'){e.preventDefault();duplicate()}
  else if(mod&&e.key.toLowerCase()==='a'){e.preventDefault();update(d=>({...d,nodes:d.nodes.map(n=>({...n,selected:true}))}),'silent')}
  else if(mod&&e.key.toLowerCase()==='g'){e.preventDefault();update(e.shiftKey?ungroupSelection:groupSelection)}
  else if(e.key.toLowerCase()==='n'&&!mod&&!e.altKey){e.preventDefault();add()}
  else if(e.key==='+'||e.key==='='){e.preventDefault();void flow.zoomIn()}
  else if(e.key==='-'){e.preventDefault();void flow.zoomOut()}
  else if(e.key==='0'){e.preventDefault();void flow.fitView({padding:.2})}
  else if(e.key==='?'){setHelp(h=>!h)}
 };window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[add,duplicate,flow,undo,redo,update])
 return <div className="canvas-page"><div className="canvas-heading"><Link to="/" aria-label="Back to canvases"><ArrowLeft size={18}/></Link><input className="canvas-name" aria-label="Canvas name" value={name} maxLength={120} onChange={e=>setName(e.target.value)}/><span className={saveError?"save-error":"save-status"} role="status">{saveError||"Saved locally"}</span><span className="muted">Double-click to add · Shift-drag to select</span></div><div className="canvas-workspace"><div className="canvas-tools"><button className="primary" onClick={()=>add()}><Plus size={17}/><span>Add node</span></button><button title="Duplicate selected (⌘/Ctrl D)" aria-label="Duplicate selected" onClick={duplicate} disabled={!nodes.some(n=>n.selected)}><Copy size={17}/></button><button title="Delete selected" aria-label="Delete selected" onClick={remove} disabled={!nodes.some(n=>n.selected)&&!edges.some(e=>e.selected)}><Trash2 size={17}/></button><i className="tool-divider"/><button title="Undo (⌘/Ctrl Z)" aria-label="Undo" onClick={undo} disabled={!canUndo}><Undo2 size={17}/></button><button title="Redo (⌘/Ctrl Shift Z)" aria-label="Redo" onClick={redo} disabled={!canRedo}><Redo2 size={17}/></button><i className="tool-divider"/><button title="Group selected (⌘/Ctrl G)" aria-label="Group selected" onClick={()=>update(groupSelection)} disabled={!nodes.some(n=>n.selected&&!n.parentId)}><Group size={17}/></button><button title="Ungroup selected" aria-label="Ungroup selected" onClick={()=>update(ungroupSelection)} disabled={!nodes.some(n=>n.selected&&n.data.kind==='section')}><Ungroup size={17}/></button></div><div className="canvas-bottom"><button aria-label="Toggle minimap" title="Toggle minimap" onClick={()=>setMinimap(v=>!v)}><Map size={16}/></button><button aria-label="Keyboard shortcuts" title="Keyboard shortcuts" onClick={()=>setHelp(v=>!v)}><Keyboard size={16}/></button><span>{nodes.filter(n=>n.data.kind!=='section').length} nodes · {edges.length} connections</span></div><SelectionPanel nodes={nodes} edges={edges}/><ReactFlow fitView={!doc.viewport&&doc.nodes.length>0} fitViewOptions={{padding:.22,maxZoom:1}} defaultViewport={doc.viewport} onMoveEnd={(_,v)=>setViewport(v)} nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeDragStart={endMerge} onSelectionDragStart={endMerge} colorMode={dark?'dark':'light'} onDoubleClick={e=>{if((e.target as HTMLElement).classList.contains('react-flow__pane'))add({x:e.clientX,y:e.clientY})}} zoomOnDoubleClick={false} minZoom={0.15} maxZoom={2.5} deleteKeyCode={['Backspace','Delete']} multiSelectionKeyCode={['Meta','Control']}><Background gap={24}/><Controls/>{minimap&&<MiniMap pannable zoomable nodeColor={dark?'#55654e':'#bccbac'} maskColor={dark?'#141716b0':'#f6f7f2b0'}/>}</ReactFlow>{nodes.length===0&&<div className="canvas-empty"><span>Every idea starts somewhere.</span><p>Double-click anywhere to add your first node.</p></div>}{help&&<div className="modal-backdrop" onClick={()=>setHelp(false)}><section className="dialog" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={e=>e.stopPropagation()}><h2>Stay in the flow</h2><p>Use ⌘ on Mac, Ctrl on Windows.</p><dl>{[['N','New node'],['⌘/Ctrl D','Duplicate'],['Delete / Backspace','Delete selection'],['⌘/Ctrl Z','Undo'],['⌘/Ctrl Shift Z','Redo'],['⌘/Ctrl A','Select all'],['⌘/Ctrl G','Group selection'],['⌘/Ctrl Shift G','Ungroup'],['+ / −','Zoom'],['0','Fit diagram'],['Shift + drag','Select an area'],['/ while editing','Insert content']].map(([key,text])=><div key={key}><dt>{text}</dt><dd><kbd>{key}</kbd></dd></div>)}</dl><button className="primary" autoFocus onClick={()=>setHelp(false)}>Got it</button></section></div>}</div></div>
}
