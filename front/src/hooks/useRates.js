import { fetchCurrencyData } from '../services/api.js';
import useApi from './useApi.js';

/** Tipos de cambio actuales: { code: unidades por 1 MXN }. */
export default function useRates() {
  const { data } = useApi(fetchCurrencyData, []);
  if (!Array.isArray(data)) return null;
  return Object.fromEntries(data.map((d) => [d.code, parseFloat(d.value)]));
}

/** Convierte con tipos de cambio por MXN; null si falta alguno. */
export function convertWithRates(amount, from, to, rates) {
  if (from === to) return amount;
  const rf = from === 'MXN' ? 1 : rates?.[from];
  const rt = to === 'MXN' ? 1 : rates?.[to];
  if (!rf || !rt) return null;
  return (amount / rf) * rt;
}
