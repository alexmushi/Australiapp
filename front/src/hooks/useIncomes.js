import { fetchIncomes } from '../services/api.js';
import useApi from './useApi.js';

const EMPTY = [];

export default function useIncomes() {
  const { data, ...rest } = useApi(fetchIncomes, [], { initialData: EMPTY });
  return { incomes: data ?? EMPTY, ...rest };
}
