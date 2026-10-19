/*
 * Fechas de gastos: se guardan como medianoche UTC del día del calendario
 * ('2025-07-01' -> 2025-07-01T00:00:00Z). Por eso los límites de mes se
 * calculan en UTC: con la hora local del servidor, un gasto del 1 de julio
 * podía contarse en junio (o el último día del mes quedar fuera).
 */

// El "mes actual" es el de Sídney, igual que en el frontend.
export const APP_TIME_ZONE = 'Australia/Sydney';

export const monthIndex = ({ year, month }) => year * 12 + (month - 1);
export const fromIndex = (idx) => ({ year: Math.floor(idx / 12), month: (idx % 12) + 1 });

export function currentMonth(now = new Date(), timeZone = APP_TIME_ZONE) {
  const [year, month] = now.toLocaleDateString('en-CA', { timeZone }).split('-').map(Number);
  return { year, month };
}

/** Primer instante del mes (UTC). */
export const monthStart = ({ year, month }) => new Date(Date.UTC(year, month - 1, 1));
/** Primer instante del mes siguiente (UTC, exclusivo). */
export const monthEndExclusive = ({ year, month }) => new Date(Date.UTC(year, month, 1));

/** Mes al que pertenece la fecha de un gasto. */
export function monthOfDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

/** Lista de meses entre dos meses, ambos incluidos. */
export function monthsBetween(from, to) {
  const out = [];
  for (let i = monthIndex(from); i <= monthIndex(to); i++) out.push(fromIndex(i));
  return out;
}

export function isValidPeriod(year, month) {
  return (
    Number.isInteger(year) && Number.isInteger(month) && year >= 2000 && year <= 2100 && month >= 1 && month <= 12
  );
}

/** '2025-07' -> { year: 2025, month: 7 } o null si no es válido. */
export function parseMonthParam(str) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(str ?? ''));
  if (!m) return null;
  const period = { year: Number(m[1]), month: Number(m[2]) };
  return isValidPeriod(period.year, period.month) ? period : null;
}

/** true si es una fecha real con formato aaaa-mm-dd. */
export function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
