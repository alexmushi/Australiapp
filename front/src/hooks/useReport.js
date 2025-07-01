import { useEffect, useState } from 'react';
import { fetchReport } from '../services/api.js';

export default function useReport(range, category) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    setData(null); 
    fetchReport(range, category)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [range, category]);

  return data;
}