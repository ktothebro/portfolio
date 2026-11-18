import { useEffect, useState } from 'react';
import { AffirmaJourneyPage } from './pages/AffirmaJourneyPage';
import { HomePage } from './pages/HomePage';

type Route = 'home' | 'affirmajourney';

function routeFromHash(): Route {
  const raw = window.location.hash.replace(/^#/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  const normalized = path.replace(/\/+$/, '') || '/';
  if (normalized === '/affirmajourney') {
    return 'affirmajourney';
  }
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('route-home', route === 'home');
    return () => document.body.classList.remove('route-home');
  }, [route]);

  if (route === 'affirmajourney') {
    return <AffirmaJourneyPage />;
  }

  return <HomePage />;
}
