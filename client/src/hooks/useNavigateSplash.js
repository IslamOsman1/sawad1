import { useEffect, useState } from 'react';

export function useNavigateSplash() {
  const [route, setRoute] = useState(location.hash.replace('#', '') || '/');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(location.hash.replace('#', '') || '/');
    };

    addEventListener('hashchange', handleHashChange);
    return () => removeEventListener('hashchange', handleHashChange);
  }, []);

  const go = (path) => {
    setLoading(true);
    setTimeout(() => {
      location.hash = path;
      setRoute(path);
      setTimeout(() => setLoading(false), 500);
    }, 250);
  };

  return { route, go, loading };
}
