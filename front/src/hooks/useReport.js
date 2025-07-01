import { useEffect, useState } from 'react';
import { fetchReport } from '../services/api.js';

export default function useReport(range) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    fetchReport(range)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [range]);

  return data;
}
