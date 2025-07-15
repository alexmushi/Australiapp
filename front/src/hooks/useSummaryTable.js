import { useEffect, useState } from 'react';
import { fetchSummaryTable } from '../services/api.js';

export default function useSummaryTable(enabled, currency) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchSummaryTable(currency)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [enabled, currency]);

  return data;
}