import { fetchCurrencies } from '../services/api.js';
import useApi from './useApi.js';

const EMPTY = [];

export default function useCurrencies() {
  const { data, ...rest } = useApi(fetchCurrencies, [], { initialData: EMPTY });
  return { currencies: data ?? EMPTY, ...rest };
}
