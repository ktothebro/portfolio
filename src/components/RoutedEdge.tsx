import { BaseEdge, getSmoothStepPath, type Edge, type EdgeProps } from '@xyflow/react';
import type { FlowEdgeData } from '../affirm/buildFlow';

export function RoutedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
  interactionWidth,
}: EdgeProps<Edge<FlowEdgeData, 'route'>>) {
  let path: string;
  if (data?.route.kind === 'polyline') {
    const points = [
      [sourceX, sourceY] as const,
      ...data.route.bends.map((bend) => [bend.x, bend.y] as const),
      [targetX, targetY] as const,
    ];
    path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`).join(' ');
  } else {
    [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 2,
    });
  }

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={style}
      interactionWidth={interactionWidth ?? 16}
    />
  );
}
