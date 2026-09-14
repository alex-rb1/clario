import { useMemo } from 'react'
import {
  BaseEdge,
  getSmoothStepPath,
  useNodes,
  type EdgeProps,
} from '@xyflow/react'
import { freehandPath, type FreehandStroke } from '../lib/freehand'
import WireLabel from './WireLabel'
import { routeWire, roundedPath, labelPosition } from '../lib/routing'
export default function RoutedEdge(props: EdgeProps) {
  const nodes = useNodes()
  const [path, labelX, labelY] = useMemo(() => {
    if (props.data?.routing === 'freehand' && props.data.freehand) {
      const path = freehandPath(
        props.data.freehand as FreehandStroke,
        { x: props.sourceX, y: props.sourceY },
        { x: props.targetX, y: props.targetY },
      )
      return [path, 0, 0] as const
    }
    const position = (
      id: string,
      seen = new Set<string>(),
    ): { x: number; y: number } => {
      const n = nodes.find((n) => n.id === id)
      if (!n || seen.has(id)) return { x: 0, y: 0 }
      seen.add(id)
      const parent = n.parentId ? position(n.parentId, seen) : { x: 0, y: 0 }
      return { x: parent.x + n.position.x, y: parent.y + n.position.y }
    }
    const boxes = nodes
      .filter((n) => n.data.kind !== 'section')
      .map((n) => ({
        ...position(n.id),
        width: n.measured?.width ?? Number(n.style?.width ?? 280),
        height: n.measured?.height ?? Number(n.style?.height ?? 180),
      }))
    const points = routeWire(
      { x: props.sourceX, y: props.sourceY },
      { x: props.targetX, y: props.targetY },
      props.sourcePosition,
      props.targetPosition,
      boxes,
    )
    if (!points)
      return getSmoothStepPath({ ...props, borderRadius: 9, offset: 32 })
    const label = labelPosition(points)
    return [roundedPath(points), label.x, label.y] as const
  }, [nodes, props])
  return (
    <>
      <defs>
        <marker
          id={`arrow-${props.id}`}
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="18"
          markerHeight="18"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 1 1 L 11 6 L 1 11 Z" fill="var(--wire-color)" />
        </marker>
      </defs>
      <BaseEdge
        id={props.id}
        path={path}
        labelX={labelX}
        labelY={labelY}
        label={undefined}
        labelStyle={props.labelStyle}
        labelShowBg={props.labelShowBg}
        labelBgStyle={props.labelBgStyle}
        labelBgPadding={[7, 4]}
        labelBgBorderRadius={4}
        style={props.style}
        markerEnd={`url(#arrow-${props.id})`}
        markerStart={props.markerStart}
        interactionWidth={28}
      />
      {props.label && (
        <WireLabel
          id={props.id}
          path={path}
          label={String(props.label)}
          data={props.data ?? {}}
          selected={props.selected}
        />
      )}
    </>
  )
}
