import { sequenceMachine } from './sequenceMachine';
import { stepMachine } from './stepMachine';
import { reduceSelection } from './selection';
import type { LifecycleMachine } from './types';

const sequenceEdges: Record<string, readonly string[]> = {
  Pending: ['Running', 'Cancelled'],
  Running: ['Paused', 'Cancelled', 'Finished', 'Failed'],
  Paused: ['Running', 'Cancelled'],
  Finished: [],
  Cancelled: [],
  Failed: [],
};

const stepEdges: Record<string, readonly string[]> = {
  Pending: ['Ready'],
  Ready: ['Paused', 'InProgress', 'Skipped', 'Cancelled'],
  Paused: ['Ready', 'Cancelled'],
  InProgress: ['Completed', 'Failed', 'Cancelled'],
  Completed: [],
  Skipped: [],
  Failed: [],
  Cancelled: [],
};

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function checkMachine(
  machine: LifecycleMachine,
  expected: Record<string, readonly string[]>,
  stateCount: number,
  transitionCount: number,
  terminals: readonly string[],
): void {
  assert(machine.states.length === stateCount, `${machine.id} state count`);
  assert(machine.transitions.length === transitionCount, `${machine.id} transition count`);

  const ids = machine.states.map((state) => state.id);
  assert(new Set(ids).size === ids.length, `${machine.id} duplicate state id`);
  assert(
    ids.every((id) => Object.prototype.hasOwnProperty.call(expected, id)),
    `${machine.id} unexpected state`,
  );

  const transitionIds = new Set<string>();
  for (const transition of machine.transitions) {
    assert(!transitionIds.has(transition.id), `${machine.id} duplicate transition ${transition.id}`);
    transitionIds.add(transition.id);
    assert(ids.includes(transition.source), `${transition.id} missing source`);
    assert(ids.includes(transition.target), `${transition.id} missing target`);
    const source = machine.states.find((state) => state.id === transition.source);
    assert(source?.terminal === false, `${transition.id} leaves a terminal state`);
  }

  for (const state of machine.states) {
    const actual = machine.transitions
      .filter((transition) => transition.source === state.id)
      .map((transition) => transition.target)
      .sort();
    const wanted = [...expected[state.id]].sort();
    assert(
      actual.length === wanted.length && actual.every((target, index) => target === wanted[index]),
      `${machine.id} ${state.id} outgoing mismatch: ${actual.join(', ')}`,
    );
    assert(state.terminal === terminals.includes(state.id), `${state.id} terminal flag`);
    if (state.terminal) {
      assert(state.terminalBehavior !== null, `${state.id} missing terminal behavior`);
    }
  }
}

export function runModelChecks(): void {
  checkMachine(sequenceMachine, sequenceEdges, 6, 8, ['Finished', 'Cancelled', 'Failed']);
  checkMachine(stepMachine, stepEdges, 8, 10, ['Completed', 'Skipped', 'Failed', 'Cancelled']);

  const inProgress = stepMachine.states.find((state) => state.id === 'InProgress');
  const toFailed = stepMachine.transitions.find((transition) => transition.id === 'InProgress>Failed');
  assert(Boolean(inProgress?.considerations.includes('In progress')), 'retry copy on In progress');
  assert(Boolean(toFailed?.considerations.includes('retry')), 'retry copy on failure transition');
  const stepPairs = stepMachine.transitions.map((transition) => `${transition.source}>${transition.target}`);
  assert(!stepPairs.includes('InProgress>InProgress'), 'no self-loop on In progress');
  assert(!stepPairs.includes('Pending>Cancelled'), 'pending step has no local cancel arrow');

  const finished = sequenceMachine.states.find((state) => state.id === 'Finished');
  const cancelled = sequenceMachine.states.find((state) => state.id === 'Cancelled');
  assert(finished?.effects.includes('client-response') === true, 'finished carries client response');
  assert(cancelled?.effects.includes('sequence-cancellation') === true, 'cancelled carries sequence cancellation');

  let selection = reduceSelection(null, 'sequence', { nodeId: 'Running' });
  assert(selection?.kind === 'node' && selection.id === 'Running', 'select sequence node');
  selection = reduceSelection(selection, 'step', { edgeId: 'Ready>Paused' });
  assert(selection?.kind === 'edge' && selection.lifecycle === 'step', 'switch lifecycle');
  selection = reduceSelection(selection, 'sequence', {});
  assert(selection?.lifecycle === 'step', 'empty change from the other diagram keeps selection');
  selection = reduceSelection(selection, 'step', {});
  assert(selection === null, 'empty change from the active diagram clears selection');
}
