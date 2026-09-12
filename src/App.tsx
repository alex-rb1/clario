import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom'
import { Moon, Sun, Workflow } from 'lucide-react'
const Canvas = lazy(() => import('./components/Canvas'))
import Dashboard from './components/Dashboard'
import { createCanvas } from './lib/storage'
import '@xyflow/react/dist/style.css'
import './App.css'
// Creation synchronizes with storage and reports storage errors to the user.
function NewCanvas() {
  const navigate = useNavigate()
  const once = useRef(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (once.current) return
    once.current = true
    try {
      navigate(`/canvas/${createCanvas().id}`, { replace: true })
    } catch {
      // eslint-disable-next-line react/set-state-in-effect
      setError('Cannot create a canvas: browser storage is unavailable.')
    }
  }, [navigate])
  return <main>{error || 'Opening your canvas…'}</main>
}
function App() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('clario-theme') !== 'light'
    } catch {
      return true
    }
  })
  function toggleTheme() {
    const next = !dark
    setDark(next)
    try {
      localStorage.setItem('clario-theme', next ? 'dark' : 'light')
    } catch {
      /* Theme remains usable without storage. */
    }
  }
  return (
    <div className="app" data-theme={dark ? 'dark' : 'light'}>
      <BrowserRouter>
        <header>
          <Link className="brand" to="/">
            <Workflow size={23} />
            clario<span> / space to think</span>
          </Link>
          <button aria-label="Toggle theme" onClick={toggleTheme}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/canvas/new" element={<NewCanvas />} />
          <Route
            path="/canvas/:id"
            element={
              <Suspense fallback={<main>Opening your thinking space…</main>}>
                <Canvas dark={dark} />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <main>
                <h1>A little off-canvas.</h1>
                <Link className="primary" to="/">
                  Back to your canvases
                </Link>
              </main>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App
