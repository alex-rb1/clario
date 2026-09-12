import type { CanvasDocument, Diagram } from './types'
const PREFIX='clario:canvas:'
function validate(value:unknown):value is CanvasDocument {
 if(!value||typeof value!=='object')return false
 const d=value as CanvasDocument
 return typeof d.id==='string'&&typeof d.name==='string'&&typeof d.updatedAt==='number'&&Array.isArray(d.nodes)&&Array.isArray(d.edges)&&d.nodes.every(n=>typeof n.id==='string'&&n.type==='block'&&typeof n.position?.x==='number'&&typeof n.position?.y==='number'&&typeof n.data?.content==='string'&&typeof n.data?.title==='string'&&typeof n.data?.code==='string'&&typeof n.data?.language==='string')&&d.edges.every(e=>typeof e.id==='string'&&typeof e.source==='string'&&typeof e.target==='string')
}
export function readCanvas(id:string):CanvasDocument|null {
 const raw=localStorage.getItem(PREFIX+id);if(!raw)return null
 let record;try{record=JSON.parse(raw)}catch{throw Error('This canvas could not be read. Its saved data has been left untouched.')}
 if(record.version!==1||!validate(record.document))throw Error('This canvas could not be read. Its saved data has been left untouched.')
 return record.document
}
export function saveCanvas(doc:CanvasDocument){localStorage.setItem(PREFIX+doc.id,JSON.stringify({version:1,document:doc}))}
export function createCanvas(name='Untitled canvas',diagram:Diagram={nodes:[],edges:[]}):CanvasDocument {
 const doc={...diagram,id:crypto.randomUUID(),name,updatedAt:Date.now()};saveCanvas(doc);return doc
}
export function listCanvases():{documents:CanvasDocument[];unreadable:number}{
 const documents:CanvasDocument[]=[];let unreadable=0
 for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(PREFIX)){try{const doc=readCanvas(key.slice(PREFIX.length));if(doc)documents.push(doc)}catch{unreadable++}}}
 return {documents:documents.sort((a,b)=>b.updatedAt-a.updatedAt),unreadable}
}
export function deleteCanvas(id:string){localStorage.removeItem(PREFIX+id)}
export function renameCanvas(id:string,name:string){const doc=readCanvas(id);if(!doc)throw Error('Canvas no longer exists.');saveCanvas({...doc,name:name.trim()||'Untitled canvas',updatedAt:Date.now()})}
