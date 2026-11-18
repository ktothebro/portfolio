import { useCallback, useEffect, useRef, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { describeSelection } from './affirm/lookup';
import { selectionsEqual } from './affirm/selection';
import { sequenceMachine } from './affirm/sequenceMachine';
import { stepMachine } from './affirm/stepMachine';
import type { Selection } from './affirm/types';
import { EditorialIntro } from './components/EditorialIntro';
import { StateDiagram } from './components/StateDiagram';
import { StateInspector } from './components/StateInspector';

export default function App() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const selectionRef = useRef<Selection | null>(null);

  const onSelect = useCallback((next: Selection | null) => {
    if (selectionsEqual(selectionRef.current, next)) {
      return;
    }
    selectionRef.current = next;
    setSelection(next);
    setAnnouncement(describeSelection(next));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onSelect(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSelect]);

  return (
    <>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <div className="mast">
        <p>AJ / State flow</p>
        <p>Sequence × Step</p>
      </div>
      <main className="page">
        <EditorialIntro />
        <div className="diagrams">
          {[sequenceMachine, stepMachine].map((machine) => (
            <section key={machine.id} className="panel" aria-labelledby={`${machine.id}-heading`}>
              <div className="panel__bar">
                <div>
                  <p className="kicker">{machine.kicker}</p>
                  <h2 id={`${machine.id}-heading`}>{machine.title}</h2>
                </div>
                <p className="panel__count">
                  {machine.states.length} states
                  <span aria-hidden="true"> · </span>
                  {machine.transitions.length} transitions
                </p>
              </div>
              <p className="panel__summary">{machine.summary}</p>
              <StateDiagram machine={machine} selection={selection} onSelect={onSelect} />
              <p className="panel__hint">
                Tab to a state or transition, then press Enter. Drag to pan. The side rule marks the
                kind of state. The accent outline marks the selection.
              </p>
            </section>
          ))}
        </div>
        <StateInspector selection={selection} onSelect={onSelect} />
      </main>
    </>
  );
}
