import type { LifecycleId, Selection } from './types';

export type DiagramChange = {
  readonly nodeId?: string;
  readonly edgeId?: string;
};

export function selectionsEqual(a: Selection | null, b: Selection | null): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.kind === b.kind && a.lifecycle === b.lifecycle && a.id === b.id;
}

/**
 * Parent-owned selection.
 * An empty change from one diagram must not clear a selection that belongs to the other.
 */
export function reduceSelection(
  current: Selection | null,
  lifecycle: LifecycleId,
  change: DiagramChange | null,
): Selection | null {
  if (!change || (!change.nodeId && !change.edgeId)) {
    return current?.lifecycle === lifecycle ? null : current;
  }
  if (change.nodeId) {
    return { kind: 'node', lifecycle, id: change.nodeId };
  }
  return { kind: 'edge', lifecycle, id: change.edgeId! };
}
