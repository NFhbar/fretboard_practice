import { useCallback, useEffect, useState } from 'react';

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const path = raw.split('?')[0];
  return path ? path.split('/').filter(Boolean) : [];
}

export function useHashRoute() {
  const [segments, setSegments] = useState(parseHash);

  useEffect(() => {
    const onChange = () => setSegments(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((path, { replace = false } = {}) => {
    const hash = '#/' + path.replace(/^\/+/, '');
    if (replace) {
      const url = window.location.pathname + window.location.search + hash;
      window.history.replaceState(null, '', url);
      setSegments(parseHash());
    } else {
      window.location.hash = hash;
    }
  }, []);

  const back = useCallback(() => {
    if (window.history.length > 1) window.history.back();
    else navigate('practice', { replace: true });
  }, [navigate]);

  return { segments, navigate, back };
}
