import { useEffect, useRef, useState } from 'react';
import { readKey, writeKey } from '../state/storage.js';

export function usePersistedState(key, defaultValue) {
  const [value, setValue] = useState(() => readKey(key, defaultValue));
  const timerRef = useRef(null);
  const latestRef = useRef(value);
  latestRef.current = value;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => writeKey(key, latestRef.current), 250);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, value]);

  // flush pending write on unmount / page hide
  useEffect(() => {
    const flush = () => writeKey(key, latestRef.current);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [key]);

  // cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key) return;
      try {
        setValue(e.newValue === null ? defaultValue : JSON.parse(e.newValue));
      } catch {
        // ignore malformed external writes
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue];
}
