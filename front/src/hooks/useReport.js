import { useEffect, useState } from 'react';
import { fetchReport } from '../services/api.js';

export default function useReport(range, category, currency) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    setData(null); // reset while fetching new data
    fetchReport(range, category, currency)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [range, category, currency]);

  return data;
}