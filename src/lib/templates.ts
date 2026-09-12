import { MarkerType } from '@xyflow/react'
import { makeNode, type Diagram, type NodeKind } from './types'
export const templates = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'A clean slate for your next idea.',
    icon: '＋',
  },
  {
    id: 'algorithm',
    name: 'Algorithm / LeetCode',
    description: 'Reason from constraints to a working solution.',
    icon: '⌘',
  },
  {
    id: 'architecture',
    name: 'System Architecture',
    description: 'Connect the pieces of a bigger system.',
    icon: '▦',
  },
  {
    id: 'flow',
    name: 'User Flow',
    description: 'Map the happy path and the what-ifs.',
    icon: '⇢',
  },
  {
    id: 'planning',
    name: 'Project Planning',
    description: 'Turn an outcome into a plan of action.',
    icon: '☷',
  },
  {
    id: 'concept',
    name: 'Concept Map',
    description: 'Explore an idea through its connections.',
    icon: '◇',
  },
] as const
export type TemplateId = (typeof templates)[number]['id']
export function buildTemplate(id: TemplateId): Diagram {
  const d: Diagram = { nodes: [], edges: [] }
  const node = (
    title: string,
    content: string,
    x: number,
    y: number,
    kind: NodeKind = 'standard',
    code?: string,
  ) => {
    const n = makeNode(x, y, kind)
    n.data = { ...n.data, title, content, ...(code ? { code } : {}) }
    if (kind === 'code') n.style = { width: 340, height: 260 }
    d.nodes.push(n)
    return n.id
  }
  const connect = (source: string, target: string, label = '') =>
    d.edges.push({
      id: crypto.randomUUID(),
      source,
      target,
      label,
      markerEnd: { type: MarkerType.ArrowClosed },
    })
  if (id === 'algorithm') {
    const a = node(
      '01 / Understand the problem',
      '<h3>Two Sum</h3><p>Find two indices whose values add up to the target.</p>',
      80,
      160,
      'input-output',
    )
    const b = node(
      '02 / Find the pattern',
      '<p>Use a hash map to remember values we have seen.</p><p><strong>Time:</strong> O(n) · <strong>Space:</strong> O(n)</p>',
      460,
      160,
      'process',
    )
    const c = node(
      '03 / Implement',
      '',
      840,
      160,
      'code',
      'function twoSum(nums: number[], target: number) {\n  const seen = new Map<number, number>();\n  for (const [i, n] of nums.entries()) {\n    const j = seen.get(target - n);\n    if (j !== undefined) return [j, i];\n    seen.set(n, i);\n  }\n  return [];\n}',
    )
    const e = node(
      '04 / Check edge cases',
      '<ul><li>Duplicate numbers</li><li>Negative values</li><li>No matching pair</li></ul>',
      460,
      460,
      'note',
    )
    connect(a, b)
    connect(b, c)
    connect(b, e, 'validate')
  } else if (id === 'architecture') {
    const a = node(
      'Web client',
      '<p>Render the interface and send authenticated requests.</p>',
      80,
      150,
      'input-output',
    )
    const b = node(
      'API gateway',
      '<p>Validate requests, apply rate limits, and route traffic.</p>',
      460,
      150,
      'process',
    )
    const c = node(
      'Application service',
      '<p>Business rules and domain operations.</p>',
      840,
      150,
      'process',
    )
    const db = node(
      'Primary database',
      '<p>Durable records with indexed queries.</p>',
      1220,
      150,
      'input-output',
    )
    const cache = node(
      'Cache',
      '<p>Short-lived data for frequently requested resources.</p>',
      840,
      430,
      'note',
    )
    const event = node(
      'Background worker',
      '<p>Process events and long-running jobs.</p>',
      1220,
      430,
      'process',
    )
    connect(a, b, 'HTTPS')
    connect(b, c, 'request')
    connect(c, db, 'read / write')
    connect(c, cache, 'lookup')
    connect(c, event, 'enqueue')
  } else if (id === 'flow') {
    const a = node(
      'Landing page',
      '<p>A clear invitation to get started.</p>',
      80,
      220,
    )
    const b = node(
      'Create an account',
      '<p>Email, password, and a simple next step.</p>',
      450,
      220,
      'process',
    )
    const c = node(
      'Details valid?',
      '<p>Check required fields and account availability.</p>',
      820,
      220,
      'decision',
    )
    const success = node(
      'Welcome aboard',
      '<p>Show the first useful action.</p>',
      1190,
      70,
      'input-output',
    )
    const error = node(
      'Help the user recover',
      '<p>Explain what needs to change, keeping their input.</p>',
      1190,
      380,
      'note',
    )
    connect(a, b)
    connect(b, c)
    connect(c, success, 'Yes')
    connect(c, error, 'No')
    connect(error, b, 'Try again')
  } else if (id === 'planning') {
    const a = node(
      'The outcome',
      '<h3>Ship something useful</h3><p>Who is this for, and what will get easier?</p>',
      80,
      240,
      'note',
    )
    const b = node(
      'Discover',
      '<ul><li>Understand the problem</li><li>Define the smallest useful scope</li></ul>',
      460,
      60,
      'process',
    )
    const c = node(
      'Build',
      '<ul><li>Lay the foundation</li><li>Implement the core workflow</li><li>Check the edge cases</li></ul>',
      840,
      60,
      'process',
    )
    const e = node(
      'Release',
      '<ul><li>Test with real users</li><li>Document the product</li><li>Ship and learn</li></ul>',
      1220,
      60,
      'process',
    )
    const risk = node(
      'Questions & risks',
      '<p>Capture assumptions and dependencies here.</p>',
      650,
      380,
      'note',
    )
    connect(a, b)
    connect(b, c)
    connect(c, e)
    connect(a, risk, 'consider')
  } else if (id === 'concept') {
    const center = node(
      'Your central idea',
      '<h3>What are you exploring?</h3><p>Give your thinking a starting point.</p>',
      480,
      270,
    )
    const why = node(
      'Why it matters',
      '<p>Purpose, context, and the problem it addresses.</p>',
      80,
      60,
      'note',
    )
    const how = node(
      'How it works',
      '<p>Mechanisms, steps, and underlying principles.</p>',
      880,
      60,
      'process',
    )
    const examples = node(
      'Examples',
      '<p>Concrete cases that make the idea tangible.</p>',
      80,
      500,
      'input-output',
    )
    const questions = node(
      'Open questions',
      '<p>What do you still want to understand?</p>',
      880,
      500,
      'decision',
    )
    connect(center, why, 'purpose')
    connect(center, how, 'mechanism')
    connect(center, examples, 'in practice')
    connect(center, questions, 'explore')
  }
  return d
}
