import { fetchReport } from '../services/api.js';
import useApi from './useApi.js';

export default function useReport(range, currency, month) {
  return useApi(() => fetchReport(range, currency, month), [range, currency, month]);
}
