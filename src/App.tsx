import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Background, Controls, ReactFlow } from '@xyflow/react'
import { ArrowLeft, ArrowUpRight, Moon, Plus, Sun, Workflow } from 'lucide-react'
import '@xyflow/react/dist/style.css'
import './App.css'

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('clario-theme') !== 'light')
  function toggleTheme() { const next = !dark; setDark(next); localStorage.setItem('clario-theme', next ? 'dark' : 'light') }
  return <div className="app" data-theme={dark ? 'dark' : 'light'}><BrowserRouter><header><Link className="brand" to="/"><Workflow size={23} />clario<span> / space to think</span></Link><button aria-label="Toggle theme" onClick={toggleTheme}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button></header><Routes><Route path="/" element={<Dashboard/>}/><Route path="/canvas/:id" element={<div className="canvas-page"><div className="canvas-heading"><Link to="/" aria-label="Back to canvases"><ArrowLeft size={18}/></Link><strong>Untitled canvas</strong><span className="muted">Your next idea starts here</span></div><ReactFlow colorMode={dark ? 'dark' : 'light'}><Background gap={24}/><Controls/></ReactFlow></div>}/></Routes></BrowserRouter></div>
}
function Dashboard() {return <main><div className="eyebrow">YOUR THINKING SPACE</div><div className="intro"><div><h1>Make room for<br/><span>your next idea.</span></h1><p>Untangle a problem. Map a system. Connect the dots.</p></div><Link className="primary" to="/canvas/new"><Plus size={18}/>New canvas</Link></div><div className="section-heading"><h2>Your canvases</h2><span className="muted">A little clarity goes a long way.</span></div><Link className="empty-card" to="/canvas/new"><div className="mini-diagram"><i/><b/><i/><b/><i/></div><h3>Start with a blank canvas <ArrowUpRight size={18}/></h3><p>Big ideas start with one small node.</p></Link><footer>BUILT FOR THE WAY DEVELOPERS THINK <span>Private by default. Yours to explore.</span></footer></main>}
export default App
