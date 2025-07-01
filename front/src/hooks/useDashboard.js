import { useEffect, useState } from 'react';
import { fetchDashboard } from '../services/api.js';

export default function useDashboard(start, end) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!start || !end) return;
    let isMounted = true;
    setLoading(true);
    fetchDashboard(start, end)
      .then((d) => {
        if (isMounted) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [start, end]);

  return { data, loading, error };
}
