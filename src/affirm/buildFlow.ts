import { MarkerType, type Edge, type Node } from '@xyflow/react';
import type { Emphasis, LifecycleMachine, Selection, Tone } from './types';
import { NODE_H, NODE_W } from './types';

export type StateNodeData = {
  label: string;
  tone: Tone;
  terminal: boolean;
  lifecycle: LifecycleMachine['id'];
  emphasis: Emphasis;
};

export type FlowEdgeData = {
  route: LifecycleMachine['transitions'][number]['route'];
  emphasis: Emphasis;
};

export type FlowColors = {
  edge: string;
  accent: string;
  focus: string;
  quiet: string;
};

const strokeFor: Record<Emphasis, keyof FlowColors> = {
  default: 'edge',
  related: 'accent',
  selected: 'focus',
  quiet: 'quiet',
};

function emphasisOf(
  kind: 'node' | 'edge',
  id: string,
  selection: Selection | null,
  lifecycle: LifecycleMachine['id'],
  relatedNodes: ReadonlySet<string>,
  relatedEdges: ReadonlySet<string>,
): Emphasis {
  if (!selection || selection.lifecycle !== lifecycle) {
    return 'default';
  }
  if (selection.kind === kind && selection.id === id) {
    return 'selected';
  }
  if (kind === 'node' && relatedNodes.has(id)) {
    return 'related';
  }
  if (kind === 'edge' && relatedEdges.has(id)) {
    return 'related';
  }
  return 'quiet';
}

function neighborhood(machine: LifecycleMachine, selection: Selection | null) {
  const relatedNodes = new Set<string>();
  const relatedEdges = new Set<string>();
  if (!selection || selection.lifecycle !== machine.id) {
    return { relatedNodes, relatedEdges };
  }
  if (selection.kind === 'node') {
    for (const transition of machine.transitions) {
      if (transition.source === selection.id || transition.target === selection.id) {
        relatedEdges.add(transition.id);
        relatedNodes.add(transition.source);
        relatedNodes.add(transition.target);
      }
    }
    relatedNodes.delete(selection.id);
    return { relatedNodes, relatedEdges };
  }
  const transition = machine.transitions.find((item) => item.id === selection.id);
  if (!transition) {
    return { relatedNodes, relatedEdges };
  }
  relatedEdges.add(transition.id);
  relatedNodes.add(transition.source);
  relatedNodes.add(transition.target);
  return { relatedNodes, relatedEdges };
}

export function buildFlow(
  machine: LifecycleMachine,
  selection: Selection | null,
  colors: FlowColors,
): { nodes: Node[]; edges: Edge[] } {
  const { relatedNodes, relatedEdges } = neighborhood(machine, selection);

  const nodes: Node[] = machine.states.map((state) => {
    const emphasis = emphasisOf('node', state.id, selection, machine.id, relatedNodes, relatedEdges);
    const data: StateNodeData = {
      label: state.label,
      tone: state.tone,
      terminal: state.terminal,
      lifecycle: machine.id,
      emphasis,
    };
    return {
      id: state.id,
      type: 'state',
      position: { ...state.position },
      width: NODE_W,
      height: NODE_H,
      draggable: false,
      connectable: false,
      selectable: true,
      deletable: false,
      focusable: true,
      selected: emphasis === 'selected',
      zIndex: emphasis === 'selected' ? 10 : 1,
      ariaLabel: `${machine.title} state ${state.label}, ${state.terminal ? 'terminal' : 'non-terminal'}`,
      ariaRole: 'button',
      style: { width: NODE_W, height: NODE_H },
      data,
    };
  });

  let minX = 0;
  let maxX = NODE_W;
  for (const state of machine.states) {
    minX = Math.min(minX, state.position.x);
    maxX = Math.max(maxX, state.position.x + NODE_W);
  }
  for (const transition of machine.transitions) {
    if (transition.route.kind === 'polyline') {
      for (const bend of transition.route.bends) {
        minX = Math.min(minX, bend.x);
        maxX = Math.max(maxX, bend.x);
      }
    }
  }
  nodes.push({
    id: `${machine.id}-bounds`,
    type: 'spacer',
    position: { x: minX - 12, y: 0 },
    width: Math.max(1, maxX - minX + 24),
    height: 1,
    draggable: false,
    selectable: false,
    connectable: false,
    deletable: false,
    focusable: false,
    ariaLabel: undefined,
    data: { spacer: true },
    style: { width: Math.max(1, maxX - minX + 24), height: 1, opacity: 0, pointerEvents: 'none' },
    domAttributes: { 'aria-hidden': true, tabIndex: -1 },
  });

  const edges: Edge[] = machine.transitions.map((transition) => {
    const emphasis = emphasisOf(
      'edge',
      transition.id,
      selection,
      machine.id,
      relatedNodes,
      relatedEdges,
    );
    const source = machine.states.find((state) => state.id === transition.source);
    const target = machine.states.find((state) => state.id === transition.target);
    const stroke = colors[strokeFor[emphasis]];
    const data: FlowEdgeData = { route: transition.route, emphasis };
    return {
      id: transition.id,
      type: 'route',
      source: transition.source,
      target: transition.target,
      sourceHandle: transition.sourceHandle,
      targetHandle: transition.targetHandle,
      selectable: true,
      deletable: false,
      focusable: true,
      reconnectable: false,
      selected: emphasis === 'selected',
      interactionWidth: 16,
      zIndex: emphasis === 'selected' ? 8 : emphasis === 'related' ? 4 : 1,
      ariaLabel: `${machine.title} transition, ${source?.label ?? transition.source} to ${target?.label ?? transition.target}. ${transition.trigger}`,
      ariaRole: 'button',
      data,
      style: {
        stroke,
        strokeWidth: emphasis === 'selected' ? 2.25 : emphasis === 'related' ? 1.7 : 1.25,
        opacity: emphasis === 'quiet' ? 0.4 : 1,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: stroke,
      },
    };
  });

  return { nodes, edges };
}
