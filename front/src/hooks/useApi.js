import { useCallback, useEffect, useState } from 'react';

/**
 * Ejecuta una petición y expone { data, error, loading, reload }.
 * Ignora respuestas que llegan después de que cambian las dependencias,
 * así nunca se muestra el reporte de un filtro anterior.
 */
export default function useApi(fetcher, deps, { enabled = true, initialData = null } = {}) {
  const [state, setState] = useState({ data: initialData, error: null, loading: enabled });
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    setState({ data: initialData, error: null, loading: true });
    fetcher()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        console.error(error);
        if (active) setState({ data: null, error, loading: false });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, nonce]);

  return { ...state, reload };
}
