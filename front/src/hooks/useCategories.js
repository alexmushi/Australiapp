import { useEffect, useState } from 'react';
import { fetchCategories } from '../services/api.js';

export default function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;
    fetchCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch((err) => console.error(err));
    return () => {
      isMounted = false;
    };
  }, []);

  return categories;
}
