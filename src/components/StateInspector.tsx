import { ArrowRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { crossEffects, type CrossEffect } from '../affirm/crossLifecycle';
import {
  getMachine,
  getState,
  getTransition,
  incomingTransitions,
  outgoingTransitions,
} from '../affirm/lookup';
import type { LifecycleId, Selection, TransitionDefinition } from '../affirm/types';

function EffectList({ ids }: { ids: readonly CrossEffect['id'][] }) {
  if (ids.length === 0) {
    return null;
  }
  return (
    <div className="effect-list">
      <h4>Cross-lifecycle</h4>
      <ul>
        {ids.map((id) => {
          const effect = crossEffects[id];
          return (
            <li key={effect.id}>
              <p className="effect-list__title">{effect.title}</p>
              <p>{effect.summary}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TransitionButton({
  lifecycle,
  transition,
  onSelect,
}: {
  lifecycle: LifecycleId;
  transition: TransitionDefinition;
  onSelect: (selection: Selection) => void;
}) {
  const source = getState(lifecycle, transition.source);
  const target = getState(lifecycle, transition.target);
  return (
    <li>
      <button
        type="button"
        className="transition-button"
        onClick={() => onSelect({ kind: 'edge', lifecycle, id: transition.id })}
      >
        <span>{source?.label ?? transition.source}</span>
        <ArrowRight aria-hidden="true" />
        <span className="sr-only">to</span>
        <span>{target?.label ?? transition.target}</span>
      </button>
    </li>
  );
}

function Orientation() {
  return (
    <div className="inspector__body">
      <h3>Nothing selected</h3>
      <p>
        Choose any state or transition in Sequence status or Step status. Both diagrams share this
        panel. Selecting an element in one clears the selection in the other.
      </p>
      <div className="inspector__split">
        <section>
          <h4>A state</h4>
          <p>Purpose, how it is entered, whether it can still change, and the transitions that leave it.</p>
        </section>
        <section>
          <h4>A transition</h4>
          <p>The triggering event, the condition, and what the lifecycle does next.</p>
        </section>
      </div>
      <p className="inspector__note">
        Two events cross the lifecycles. A client response finishes the sequence. Cancelling the
        sequence ends it as cancelled. In both cases, unfinished steps move to Cancelled. Inspect
        Finished, Cancelled, or a transition into either state for the full account.
      </p>
    </div>
  );
}

function NodeDetail({
  selection,
  onSelect,
}: {
  selection: Extract<Selection, { kind: 'node' }>;
  onSelect: (selection: Selection) => void;
}) {
  const machine = getMachine(selection.lifecycle);
  const state = getState(selection.lifecycle, selection.id);
  if (!state) {
    return <Orientation />;
  }
  const outgoing = outgoingTransitions(selection.lifecycle, state.id);
  const incoming = incomingTransitions(selection.lifecycle, state.id);

  return (
    <div className="inspector__body">
      <p className="kicker">
        {machine.title} · {state.terminal ? 'Terminal state' : 'Non-terminal state'}
      </p>
      <h3>{state.label}</h3>
      <p>{state.purpose}</p>
      <dl className="facts">
        <div>
          <dt>Entry</dt>
          <dd>{state.entry}</dd>
        </div>
        <div>
          <dt>Leaves this state</dt>
          <dd>{state.terminal ? 'No. This state is terminal.' : 'Yes. The transitions below are allowed.'}</dd>
        </div>
        {state.terminalBehavior ? (
          <div>
            <dt>After arrival</dt>
            <dd>{state.terminalBehavior}</dd>
          </div>
        ) : null}
      </dl>
      <p>{state.considerations}</p>
      <EffectList ids={state.effects} />
      <div className="inspector__split">
        <section>
          <h4>Outgoing</h4>
          {outgoing.length === 0 ? (
            <p>None. Terminal states have no outgoing transitions.</p>
          ) : (
            <ul className="transition-list">
              {outgoing.map((transition) => (
                <TransitionButton
                  key={transition.id}
                  lifecycle={selection.lifecycle}
                  transition={transition}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          )}
        </section>
        <section>
          <h4>Reached from</h4>
          {incoming.length === 0 ? (
            <p>No local transition enters this state. It is an entry state.</p>
          ) : (
            <ul className="transition-list">
              {incoming.map((transition) => (
                <TransitionButton
                  key={transition.id}
                  lifecycle={selection.lifecycle}
                  transition={transition}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function EdgeDetail({
  selection,
  onSelect,
}: {
  selection: Extract<Selection, { kind: 'edge' }>;
  onSelect: (selection: Selection) => void;
}) {
  const machine = getMachine(selection.lifecycle);
  const transition = getTransition(selection.lifecycle, selection.id);
  if (!transition) {
    return <Orientation />;
  }
  const source = getState(selection.lifecycle, transition.source);
  const target = getState(selection.lifecycle, transition.target);

  return (
    <div className="inspector__body">
      <p className="kicker">{machine.title} · Transition</p>
      <h3>
        <span>{source?.label ?? transition.source}</span>
        <ArrowRight aria-hidden="true" />
        <span className="sr-only">to</span>
        <span>{target?.label ?? transition.target}</span>
      </h3>
      <dl className="facts">
        <div>
          <dt>Trigger</dt>
          <dd>{transition.trigger}</dd>
        </div>
        <div>
          <dt>Condition</dt>
          <dd>{transition.conditions}</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd>{transition.result}</dd>
        </div>
      </dl>
      <p>{transition.considerations}</p>
      <EffectList ids={transition.effects} />
      <div className="inspector__split">
        <section>
          <h4>Source</h4>
          <button
            type="button"
            className="text-button"
            onClick={() =>
              onSelect({ kind: 'node', lifecycle: selection.lifecycle, id: transition.source })
            }
          >
            Inspect {source?.label ?? transition.source}
          </button>
        </section>
        <section>
          <h4>Destination</h4>
          <button
            type="button"
            className="text-button"
            onClick={() =>
              onSelect({ kind: 'node', lifecycle: selection.lifecycle, id: transition.target })
            }
          >
            Inspect {target?.label ?? transition.target}
          </button>
        </section>
      </div>
    </div>
  );
}

export function StateInspector({
  selection,
  onSelect,
}: {
  selection: Selection | null;
  onSelect: (selection: Selection | null) => void;
}) {
  const reduced = useReducedMotion();
  const key = selection ? `${selection.lifecycle}-${selection.kind}-${selection.id}` : 'empty';

  return (
    <section className="inspector" aria-labelledby="inspector-heading">
      <div className="inspector__bar">
        <h2 id="inspector-heading">Inspection</h2>
        {selection ? (
          <button type="button" className="text-button" onClick={() => onSelect(null)}>
            <X aria-hidden="true" />
            Clear selection
          </button>
        ) : (
          <p>Shared by both diagrams</p>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -4 }}
          transition={reduced ? { duration: 0 } : { duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {selection?.kind === 'node' ? (
            <NodeDetail selection={selection} onSelect={onSelect} />
          ) : selection?.kind === 'edge' ? (
            <EdgeDetail selection={selection} onSelect={onSelect} />
          ) : (
            <Orientation />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
