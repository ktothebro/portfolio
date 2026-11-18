import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { CSSProperties } from 'react';
import type { StateNodeData } from '../affirm/buildFlow';

const handles: ReadonlyArray<{
  id: string;
  type: 'source' | 'target';
  position: Position;
  style: CSSProperties;
}> = [
  { id: 't', type: 'target', position: Position.Top, style: { left: '50%' } },
  { id: 't-l', type: 'target', position: Position.Top, style: { left: '28%' } },
  { id: 't-r', type: 'target', position: Position.Top, style: { left: '72%' } },
  { id: 'b', type: 'source', position: Position.Bottom, style: { left: '50%' } },
  { id: 'b-r', type: 'source', position: Position.Bottom, style: { left: '72%' } },
  { id: 'b-rr', type: 'source', position: Position.Bottom, style: { left: '88%' } },
  { id: 'l-t', type: 'target', position: Position.Left, style: { top: '36%' } },
  { id: 'l', type: 'target', position: Position.Left, style: { top: '50%' } },
  { id: 'l-b', type: 'target', position: Position.Left, style: { top: '70%' } },
  { id: 'l-s', type: 'source', position: Position.Left, style: { top: '50%' } },
  { id: 'l-s-lo', type: 'source', position: Position.Left, style: { top: '68%' } },
  { id: 'r-s-hi', type: 'source', position: Position.Right, style: { top: '36%' } },
  { id: 'r-s', type: 'source', position: Position.Right, style: { top: '50%' } },
  { id: 'r-t', type: 'target', position: Position.Right, style: { top: '68%' } },
  { id: 'r-t-mid', type: 'target', position: Position.Right, style: { top: '50%' } },
];

export function StateNode({ data }: NodeProps<Node<StateNodeData, 'state'>>) {
  return (
    <div
      className={`state-node state-node--${data.emphasis}`}
      data-tone={data.tone}
      data-terminal={data.terminal ? 'true' : 'false'}
    >
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type={handle.type}
          position={handle.position}
          isConnectable={false}
          className="state-handle"
          style={handle.style}
        />
      ))}
      <span className="state-node__meta">
        <span>{data.terminal ? 'Terminal' : 'Non-terminal'}</span>
        <span className="state-node__mark" aria-hidden="true" />
      </span>
      <span className="state-node__label">{data.label}</span>
    </div>
  );
}
