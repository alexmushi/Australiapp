import { useEffect, useState } from 'react';
import { fetchDashboard } from '../services/api.js';

export default function useDashboard(range) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { start, end } = range;
    setLoading(true);
    fetchDashboard(start, end)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, [range]);

  return { data, loading, error };
}
