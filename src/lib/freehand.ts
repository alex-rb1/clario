import type { Point } from './routing'
export type FreehandStroke = { points: Point[]; source: Point; target: Point }
/** Translate each point with a blend of endpoint movements, keeping both ends attached. */
export function freehandPath(
  stroke: FreehandStroke,
  source: Point,
  target: Point,
) {
  const lengths = [0]
  for (let i = 1; i < stroke.points.length; i++)
    lengths.push(
      lengths[i - 1] +
        Math.hypot(
          stroke.points[i].x - stroke.points[i - 1].x,
          stroke.points[i].y - stroke.points[i - 1].y,
        ),
    )
  const total = lengths.at(-1) || 1
  const points = stroke.points.map((p, i) => {
    const t = lengths[i] / total
    return {
      x:
        p.x +
        (source.x - stroke.source.x) * (1 - t) +
        (target.x - stroke.target.x) * t,
      y:
        p.y +
        (source.y - stroke.source.y) * (1 - t) +
        (target.y - stroke.target.y) * t,
    }
  })
  if (points.length < 2)
    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`
  points[0] = source
  points[points.length - 1] = target
  return points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')
}
