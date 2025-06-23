import { useEffect, useState } from 'react';
import { fetchCurrencies } from '../services/api.js';

export default function useCurrencies() {
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    let isMounted = true;
    fetchCurrencies()
      .then((data) => {
        if (isMounted) setCurrencies(data);
      })
      .catch((err) => console.error(err));
    return () => {
      isMounted = false;
    };
  }, []);

  return currencies;
}
