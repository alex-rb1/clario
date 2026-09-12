export type Point = { x: number; y: number }
export type Obstacle = { x: number; y: number; width: number; height: number }
type Side = 'left' | 'right' | 'top' | 'bottom'
const direction = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
}
const clearance = 18
function segmentClear(a: Point, b: Point, boxes: Obstacle[]) {
  return !boxes.some((r) =>
    a.x === b.x
      ? a.x > r.x &&
        a.x < r.x + r.width &&
        Math.max(a.y, b.y) > r.y &&
        Math.min(a.y, b.y) < r.y + r.height
      : a.y > r.y &&
        a.y < r.y + r.height &&
        Math.max(a.x, b.x) > r.x &&
        Math.min(a.x, b.x) < r.x + r.width,
  )
}
class Queue {
  items: { key: number; score: number }[] = []
  push(item: { key: number; score: number }) {
    let i = this.items.length
    this.items.push(item)
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.items[p].score <= item.score) break
      this.items[i] = this.items[p]
      i = p
    }
    this.items[i] = item
  }
  pop() {
    const first = this.items[0],
      last = this.items.pop()!
    if (this.items.length) {
      let i = 0
      while (i * 2 + 1 < this.items.length) {
        let c = i * 2 + 1
        if (
          c + 1 < this.items.length &&
          this.items[c + 1].score < this.items[c].score
        )
          c++
        if (this.items[c].score >= last.score) break
        this.items[i] = this.items[c]
        i = c
      }
      this.items[i] = last
    }
    return first
  }
}
/** Orthogonal A* routing on obstacle boundaries. Ports retain the user's chosen sides. */
export function routeWire(
  source: Point,
  target: Point,
  sourceSide: Side,
  targetSide: Side,
  obstacles: Obstacle[],
): Point[] | null {
  const a = direction[sourceSide],
    b = direction[targetSide]
  const start = { x: source.x + a.x * 32, y: source.y + a.y * 32 },
    end = { x: target.x + b.x * 32, y: target.y + b.y * 32 }
  const minX = Math.min(start.x, end.x) - 300,
    maxX = Math.max(start.x, end.x) + 300,
    minY = Math.min(start.y, end.y) - 300,
    maxY = Math.max(start.y, end.y) + 300
  const boxes = obstacles
    .filter(
      (r) =>
        r.x + r.width >= minX &&
        r.x <= maxX &&
        r.y + r.height >= minY &&
        r.y <= maxY,
    )
    .map((r) => ({
      x: r.x - clearance,
      y: r.y - clearance,
      width: r.width + clearance * 2,
      height: r.height + clearance * 2,
    }))
  const xs = [
    ...new Set([
      start.x,
      end.x,
      minX,
      maxX,
      ...boxes.flatMap((r) => [r.x, r.x + r.width]),
    ]),
  ].sort((a, b) => a - b)
  const ys = [
    ...new Set([
      start.y,
      end.y,
      minY,
      maxY,
      ...boxes.flatMap((r) => [r.y, r.y + r.height]),
    ]),
  ].sort((a, b) => a - b)
  const width = xs.length,
    point = (i: number): Point => ({
      x: xs[i % width],
      y: ys[Math.floor(i / width)],
    })
  const begin = ys.indexOf(start.y) * width + xs.indexOf(start.x),
    finish = ys.indexOf(end.y) * width + xs.indexOf(end.x)
  const blocked = new Set<number>()
  ys.forEach((y, j) =>
    xs.forEach((x, i) => {
      if (
        boxes.some(
          (r) => x > r.x && x < r.x + r.width && y > r.y && y < r.y + r.height,
        )
      )
        blocked.add(j * width + i)
    }),
  )
  if (blocked.has(begin) || blocked.has(finish)) return null
  const queue = new Queue(),
    cost = new Map<number, number>(),
    previous = new Map<number, number>(),
    visited = new Set<number>()
  const initial = begin * 2 + (a.x ? 0 : 1)
  cost.set(initial, 0)
  queue.push({ key: initial, score: 0 })
  let result: number | undefined
  while (queue.items.length) {
    const { key } = queue.pop()
    if (visited.has(key)) continue
    visited.add(key)
    const index = Math.floor(key / 2),
      axis = key % 2,
      p = point(index)
    if (index === finish) {
      result = key
      break
    }
    const col = index % width,
      row = Math.floor(index / width)
    const neighbors = [
      col > 0 ? index - 1 : -1,
      col < width - 1 ? index + 1 : -1,
      row > 0 ? index - width : -1,
      row < ys.length - 1 ? index + width : -1,
    ]
    for (const next of neighbors) {
      if (next < 0 || blocked.has(next)) continue
      const q = point(next),
        nextAxis = p.y === q.y ? 0 : 1,
        nextKey = next * 2 + nextAxis
      if (!segmentClear(p, q, boxes)) continue
      const value =
        cost.get(key)! +
        Math.abs(q.x - p.x) +
        Math.abs(q.y - p.y) +
        (axis === nextAxis ? 0 : 28) +
        (next === finish && nextAxis !== (b.x ? 0 : 1) ? 28 : 0)
      if (value >= (cost.get(nextKey) ?? Infinity)) continue
      cost.set(nextKey, value)
      previous.set(nextKey, key)
      queue.push({
        key: nextKey,
        score: value + Math.abs(q.x - end.x) + Math.abs(q.y - end.y),
      })
    }
  }
  if (result === undefined) return null
  const points: Point[] = []
  for (let k: number | undefined = result; k !== undefined; k = previous.get(k))
    points.unshift(point(Math.floor(k / 2)))
  const full = [source, ...points, target]
  return full.filter((p, i) => {
    if (i === 0 || i === full.length - 1) return true
    const before = full[i - 1],
      after = full[i + 1]
    return !(
      (before.x === p.x && p.x === after.x) ||
      (before.y === p.y && p.y === after.y)
    )
  })
}
export function roundedPath(points: Point[]) {
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1],
      p = points[i],
      next = points[i + 1],
      before = Math.hypot(p.x - prev.x, p.y - prev.y),
      after = Math.hypot(next.x - p.x, next.y - p.y)
    if (!before || !after) continue
    const r = Math.min(9, before / 2, after / 2)
    path += ` L ${p.x + ((prev.x - p.x) * r) / before} ${p.y + ((prev.y - p.y) * r) / before} Q ${p.x} ${p.y} ${p.x + ((next.x - p.x) * r) / after} ${p.y + ((next.y - p.y) * r) / after}`
  }
  const last = points[points.length - 1]
  return path + ` L ${last.x} ${last.y}`
}
export function labelPosition(points: Point[]) {
  let best = 0,
    center = points[0]
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      length = Math.hypot(b.x - a.x, b.y - a.y)
    if (length > best) {
      best = length
      center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    }
  }
  return center
}
