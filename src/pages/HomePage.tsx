import { useEffect } from 'react';
import './HomePage.css';

export function HomePage() {
  useEffect(() => {
    document.title = 'Kai Brown — Software Engineer';
  }, []);

  return (
    <div className="home">
      <header className="home-mast">
        <a className="home-mast__mark" href="#/">
          Kai Brown
        </a>
        <nav className="home-mast__nav" aria-label="Primary">
          <a href="#work">Selected Work</a>
          <a href="#/affirmajourney">AffirmaJourney</a>
        </nav>
        <p className="home-mast__meta">Portfolio</p>
      </header>

      <main>
        <section className="spread" aria-labelledby="opening-heading">
          <p className="spread__index">01 — Opening</p>
          <h1 id="opening-heading" className="spread__name">
            <span className="spread__line">Kai</span>
            <span className="spread__line">
              Brown<span className="spread__mark">.</span>
            </span>
          </h1>
          <div className="spread__aside">
            <p className="spread__role">Software Engineer.</p>
            <ul className="spread__areas">
              <li>Backend Systems</li>
              <li>Applied AI</li>
              <li>Product Engineering</li>
            </ul>
            <a className="spread__next" href="#work">
              Selected Work
              <span aria-hidden="true"> ↓</span>
            </a>
          </div>
        </section>

        <section className="work" id="work" aria-labelledby="work-heading">
          <div className="work__inner">
            <header className="work__header">
              <p className="work__index">02</p>
              <h2 id="work-heading">Selected Work</h2>
            </header>
            <div className="work__layout">
              <article className="preview preview--affirm" aria-labelledby="affirm-heading">
                <p className="preview__kicker">01 / Backend systems</p>
                <h3 id="affirm-heading">
                  <a href="#/affirmajourney">AffirmaJourney</a>
                </h3>
                <p className="preview__summary">
                  Backend systems design and workflow orchestration. A sequence and its steps move
                  through explicit states.
                </p>
                <div className="flow" aria-hidden="true">
                  <span>Pending</span>
                  <span className="flow__arrow">→</span>
                  <span className="flow__run">Running</span>
                  <span className="flow__arrow">→</span>
                  <span>Finished</span>
                </div>
                <a className="preview__open" href="#/affirmajourney">
                  View the state flow
                </a>
              </article>

              <article className="preview preview--maint" aria-labelledby="maint-heading">
                <p className="preview__kicker">02 / Applied AI</p>
                <h3 id="maint-heading">MaintenanceFlow</h3>
                <p className="preview__summary">
                  AI-powered property maintenance coordination. A report becomes a tracked next
                  action.
                </p>
                <div className="chat">
                  <p className="chat__line chat__line--in">
                    <span className="chat__who">Resident</span>
                    The heater is short-cycling.
                  </p>
                  <p className="chat__line chat__line--out">
                    <span className="chat__who">Flow</span>
                    Logged. Checking the last service record.
                  </p>
                </div>
                <p className="preview__soon">Case study coming soon</p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
