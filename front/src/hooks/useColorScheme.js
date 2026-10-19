import { useEffect, useState } from 'react';

const query = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

/** 'dark' | 'light', actualizado cuando cambia la preferencia del sistema. */
export default function useColorScheme() {
  const [scheme, setScheme] = useState(() => (query()?.matches ? 'dark' : 'light'));
  useEffect(() => {
    const mq = query();
    if (!mq) return undefined;
    const onChange = (e) => setScheme(e.matches ? 'dark' : 'light');
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return scheme;
}

/** Convierte 'var(--x)' en su valor actual para librerías que no entienden CSS vars. */
export function resolveCssColor(color) {
  const m = /^var\((--[\w-]+)\)$/.exec(color);
  if (!m || typeof window === 'undefined') return color;
  return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || '#999999';
}
