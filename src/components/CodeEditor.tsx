import { useMemo, useState, type ReactNode } from 'react'
import { createLowlight, common } from 'lowlight'
import { Copy, Check } from 'lucide-react'
const lowlight = createLowlight(common)
const languages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'swift',
  'sql',
  'bash',
  'json',
  'css',
  'html',
]
function renderTree(
  node: {
    type: string
    value?: string
    tagName?: string
    properties?: Record<string, unknown>
    children?: unknown[]
  },
  key: number,
): ReactNode {
  if (node.type === 'text') return node.value
  return (
    <span
      key={key}
      className={(node.properties?.className as string[] | undefined)?.join(
        ' ',
      )}
    >
      {node.children?.map((child, i) =>
        renderTree(child as Parameters<typeof renderTree>[0], i),
      )}
    </span>
  )
}
export default function CodeEditor({
  code,
  language,
  active,
  onChange,
}: {
  code: string
  language: string
  active: boolean
  onChange: (data: { code?: string; language?: string }) => void
}) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)
  const highlighted = useMemo(() => {
    try {
      return lowlight
        .highlight(language, code)
        .children.map((n, i) => renderTree(n, i))
    } catch {
      return code
    }
  }, [code, language])
  return (
    <div
      className="code-editor nodrag nowheel"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="code-heading">
        <select
          aria-label="Code language"
          value={language}
          onChange={(e) => onChange({ language: e.target.value })}
        >
          {languages.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <button
          aria-label="Copy code"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code)
              setCopied(true)
              setError(false)
              setTimeout(() => setCopied(false), 1800)
            } catch {
              setError(true)
            }
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{error ? 'Copy failed' : copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      {active ? (
        <textarea
          aria-label="Code content"
          spellCheck={false}
          value={code}
          onChange={(e) => onChange({ code: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault()
              const t = e.currentTarget
              const start = t.selectionStart
              onChange({
                code: code.slice(0, start) + '  ' + code.slice(t.selectionEnd),
              })
              requestAnimationFrame(() => {
                t.selectionStart = t.selectionEnd = start + 2
              })
            }
          }}
        />
      ) : (
        <pre>
          <code>{highlighted}</code>
        </pre>
      )}
    </div>
  )
}
