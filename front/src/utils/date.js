// Las fechas de los gastos se registran en hora de Sídney.
export const APP_TIME_ZONE = 'Australia/Sydney';

/**
 * Convierte una fecha ISO ('2025-07-01' o '2025-07-01T00:00:00.000Z') a dd/mm/aaaa.
 * Usa solo la parte de fecha para no desplazar el día por la zona horaria.
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const str = isoDate instanceof Date ? isoDate.toISOString() : String(isoDate);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
};

/** Fecha de hoy (aaaa-mm-dd) en la zona horaria indicada. */
export const todayISO = (timeZone = APP_TIME_ZONE, now = new Date()) =>
  now.toLocaleDateString('en-CA', { timeZone });

/** Mes actual (aaaa-mm) en la zona horaria indicada. */
export const currentMonthISO = (timeZone = APP_TIME_ZONE, now = new Date()) =>
  todayISO(timeZone, now).slice(0, 7);

/** true si el texto es una fecha de calendario real con formato aaaa-mm-dd. */
export const isValidISODate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  );
};

const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const MONTHS_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const monthShort = (m) => MONTHS_SHORT[m - 1] ?? '';

/** '2025-07' -> 'julio 2025' */
export const monthLabel = (monthISO) => {
  const [y, m] = String(monthISO).split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return '';
  return `${MONTHS_LONG[m - 1]} ${y}`;
};

export const MONTH_OPTIONS = MONTHS_SHORT.map((label, i) => ({
  value: String(i + 1),
  label,
}));
