import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type EdgeTypes,
  type NodeTypes,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import { buildFlow, type FlowColors } from '../affirm/buildFlow';
import type { LifecycleMachine, Selection } from '../affirm/types';
import { RoutedEdge } from './RoutedEdge';
import { StateNode } from './StateNode';

const nodeTypes: NodeTypes = {
  state: StateNode,
  spacer: function BoundsSpacer() {
    return null;
  },
};

const edgeTypes: EdgeTypes = {
  route: RoutedEdge,
};

const fallbackColors: FlowColors = {
  edge: '#9a9386',
  accent: '#e0c9a0',
  focus: '#f6edd9',
  quiet: '#6a655c',
};

function readColors(): FlowColors {
  if (typeof document === 'undefined') {
    return fallbackColors;
  }
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    edge: read('--color-edge', fallbackColors.edge),
    accent: read('--color-accent', fallbackColors.accent),
    focus: read('--color-focus', fallbackColors.focus),
    quiet: read('--color-edge-quiet', fallbackColors.quiet),
  };
}

function ViewportSync({ container }: { container: RefObject<HTMLDivElement | null> }) {
  const { fitView } = useReactFlow();
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = container.current;
    if (!element) {
      return;
    }
    let frame = 0;
    let lastWidth = element.clientWidth;
    const fit = (animate: boolean) => {
      void fitView({
        padding: 0.1,
        duration: !animate || reduced ? 0 : 180,
        maxZoom: 1.12,
        minZoom: 0.55,
      });
    };
    frame = requestAnimationFrame(() => fit(false));
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth;
      if (Math.abs(width - lastWidth) < 48) {
        return;
      }
      lastWidth = width;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fit(true));
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [container, fitView, reduced]);

  return null;
}

function DiagramCanvas({
  machine,
  selection,
  onSelect,
  frame,
}: {
  machine: LifecycleMachine;
  selection: Selection | null;
  onSelect: (selection: Selection | null) => void;
  frame: RefObject<HTMLDivElement | null>;
}) {
  const colors = useMemo(() => readColors(), []);
  const { nodes, edges } = useMemo(
    () => buildFlow(machine, selection, colors),
    [machine, selection, colors],
  );

  const choose = useCallback(
    (next: Selection) => {
      onSelect(next);
    },
    [onSelect],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      const node = selectedNodes.find((item) => item.type === 'state');
      const edge = selectedEdges[0];
      if (node) {
        choose({ kind: 'node', lifecycle: machine.id, id: node.id });
        return;
      }
      if (edge) {
        choose({ kind: 'edge', lifecycle: machine.id, id: edge.id });
      }
    },
    [choose, machine.id],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      colorMode="dark"
      minZoom={0.55}
      maxZoom={1.65}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      edgesReconnectable={false}
      nodesFocusable
      edgesFocusable
      elevateNodesOnSelect={false}
      elevateEdgesOnSelect={false}
      selectNodesOnDrag={false}
      selectionOnDrag={false}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      deleteKeyCode={null}
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      panOnScroll={false}
      panOnDrag
      autoPanOnNodeFocus
      onSelectionChange={onSelectionChange}
      onPaneClick={() => onSelect(null)}
      onNodeClick={(_, node) => {
        if (node.type !== 'state') {
          return;
        }
        choose({ kind: 'node', lifecycle: machine.id, id: node.id });
      }}
      onEdgeClick={(_, edge) => {
        choose({ kind: 'edge', lifecycle: machine.id, id: edge.id });
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }
        const target = event.target;
        if (!(target instanceof Element)) {
          return;
        }
        const node = target.closest('.react-flow__node');
        const edge = target.closest('.react-flow__edge');
        if (node) {
          const id = node.getAttribute('data-id');
          if (!id || id.endsWith('-bounds')) {
            return;
          }
          event.preventDefault();
          choose({ kind: 'node', lifecycle: machine.id, id });
          return;
        }
        if (edge) {
          const id = edge.getAttribute('data-id');
          if (!id) {
            return;
          }
          event.preventDefault();
          choose({ kind: 'edge', lifecycle: machine.id, id });
        }
      }}
      proOptions={{ hideAttribution: false }}
      aria-label={`${machine.title} diagram`}
    >
      <ViewportSync container={frame} />
      <Background
        id={`${machine.id}-grid`}
        variant={BackgroundVariant.Dots}
        gap={18}
        size={1.1}
        color="#2a3038"
      />
      <Controls
        showInteractive={false}
        position="top-right"
        aria-label={`${machine.title} viewport controls`}
      />
    </ReactFlow>
  );
}

export function StateDiagram({
  machine,
  selection,
  onSelect,
}: {
  machine: LifecycleMachine;
  selection: Selection | null;
  onSelect: (selection: Selection | null) => void;
}) {
  const frame = useRef<HTMLDivElement>(null);

  return (
    <ReactFlowProvider>
      <div ref={frame} className="diagram-frame">
        <DiagramCanvas machine={machine} selection={selection} onSelect={onSelect} frame={frame} />
      </div>
    </ReactFlowProvider>
  );
}
