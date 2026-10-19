import { fetchSummaryTable } from '../services/api.js';
import useApi from './useApi.js';

export default function useSummaryTable(enabled, currency) {
  return useApi(() => fetchSummaryTable(currency), [currency], { enabled });
}
