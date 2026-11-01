import { fetchCategories } from '../services/api.js';
import useApi from './useApi.js';

const EMPTY = [];

export default function useCategories() {
  const { data, ...rest } = useApi(fetchCategories, [], { initialData: EMPTY });
  return { categories: data ?? EMPTY, ...rest };
}
