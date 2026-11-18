import { sequenceMachine } from './sequenceMachine';
import { stepMachine } from './stepMachine';
import type { LifecycleId, LifecycleMachine, Selection, StateDefinition, TransitionDefinition } from './types';

const machines = {
  sequence: sequenceMachine,
  step: stepMachine,
} as const;

export function getMachine(id: LifecycleId): LifecycleMachine {
  return machines[id];
}

export function getState(lifecycle: LifecycleId, id: string): StateDefinition | undefined {
  return getMachine(lifecycle).states.find((state) => state.id === id);
}

export function getTransition(lifecycle: LifecycleId, id: string): TransitionDefinition | undefined {
  return getMachine(lifecycle).transitions.find((transition) => transition.id === id);
}

export function outgoingTransitions(lifecycle: LifecycleId, stateId: string): readonly TransitionDefinition[] {
  return getMachine(lifecycle).transitions.filter((transition) => transition.source === stateId);
}

export function incomingTransitions(lifecycle: LifecycleId, stateId: string): readonly TransitionDefinition[] {
  return getMachine(lifecycle).transitions.filter((transition) => transition.target === stateId);
}

export function describeSelection(selection: Selection | null): string {
  if (!selection) {
    return 'Selection cleared.';
  }
  const machine = getMachine(selection.lifecycle);
  if (selection.kind === 'node') {
    const state = getState(selection.lifecycle, selection.id);
    if (!state) {
      return '';
    }
    return `${machine.title}, state ${state.label}. ${state.terminal ? 'Terminal.' : 'Non-terminal.'} ${state.purpose}`;
  }
  const transition = getTransition(selection.lifecycle, selection.id);
  if (!transition) {
    return '';
  }
  const source = getState(selection.lifecycle, transition.source);
  const target = getState(selection.lifecycle, transition.target);
  return `${machine.title}, transition ${source?.label ?? transition.source} to ${target?.label ?? transition.target}. ${transition.trigger}`;
}
