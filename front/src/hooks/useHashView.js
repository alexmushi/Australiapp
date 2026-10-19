import { useCallback, useEffect, useState } from 'react';

/**
 * Vista actual sincronizada con el hash de la URL (#/gasto), para que el botón
 * "atrás" del navegador/móvil funcione entre pantallas.
 */
export default function useHashView(views, fallback) {
  const read = useCallback(() => {
    const key = window.location.hash.replace(/^#\/?/, '');
    const match = Object.entries(views).find(([, slug]) => slug === key);
    return match ? match[0] : fallback;
  }, [views, fallback]);

  const [view, setView] = useState(read);

  useEffect(() => {
    const onChange = () => setView(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [read]);

  const navigate = useCallback(
    (next) => {
      const slug = views[next] ?? '';
      if (window.location.hash.replace(/^#\/?/, '') !== slug) {
        window.location.hash = `/${slug}`;
      }
      setView(next in views ? next : fallback);
      window.scrollTo?.({ top: 0 });
    },
    [views, fallback]
  );

  return [view, navigate];
}
