import { sequenceMachine } from '../affirm/sequenceMachine';
import { stepMachine } from '../affirm/stepMachine';

export function EditorialIntro() {
  return (
    <header className="intro">
      <p className="kicker">AffirmaJourney</p>
      <h1>Interactive state flow</h1>
      <p className="lede">
        An assigned sequence and each step inside it follow two linked lifecycles. One governs the
        assignment as a whole. The other governs a single step. They meet when a sequence finishes
        or is cancelled.
      </p>
      <p className="instructions">
        Select a state or a transition in either diagram. The inspection panel explains what it
        means, what can happen next, and where the lifecycles affect each other. Drag a diagram to
        pan it. Use its zoom controls to resize it. Press Escape to clear the selection.
      </p>
      <dl className="meta">
        <div>
          <dt>Sequence status</dt>
          <dd>
            {sequenceMachine.states.length} states · {sequenceMachine.transitions.length} transitions
          </dd>
        </div>
        <div>
          <dt>Step status</dt>
          <dd>
            {stepMachine.states.length} states · {stepMachine.transitions.length} transitions
          </dd>
        </div>
        <div>
          <dt>Model</dt>
          <dd>Read-only · not a live execution</dd>
        </div>
      </dl>
    </header>
  );
}
