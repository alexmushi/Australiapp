import { fetchReport } from '../services/api.js';
import useApi from './useApi.js';

export default function useReport(range, category, currency, month, { enabled = true } = {}) {
  return useApi(() => fetchReport(range, category, currency, month), [
    range,
    category,
    currency,
    month,
  ], { enabled });
}
