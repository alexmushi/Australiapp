import { useEffect, useState } from 'react';
import { fetchCurrencyRates } from '../services/api.js';

export default function useCurrencyRates() {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    let active = true;
    fetchCurrencyRates()
      .then((d) => {
        if (active) setRates(d);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, []);

  return rates;
}

