import { fetchSummaryTable } from '../services/api.js';
import useApi from './useApi.js';

export default function useSummaryTable(currency) {
  return useApi(() => fetchSummaryTable(currency), [currency]);
}
