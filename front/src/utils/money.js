const LOCALE = 'es-MX';

/** Redondea a centavos evitando errores de coma flotante (1.005 -> 1.01). */
export function roundCents(value) {
  // toPrecision elimina el ruido binario (5.005 * 100 = 500.49999...).
  return Math.round(Number((Number(value) * 100).toPrecision(12))) / 100;
}

/**
 * Normaliza lo que el usuario escribe en un campo de monto. Acepta coma o punto
 * como separador decimal (teclados en español) y como máximo 2 decimales.
 * Devuelve null si el texto no puede ser un monto.
 */
export function sanitizeAmountInput(raw) {
  const value = String(raw ?? '').replace(',', '.').replace(/\s/g, '');
  if (!/^\d*\.?\d{0,2}$/.test(value)) return null;
  return value;
}

/** Convierte el texto de un monto en número. NaN si no es válido. */
export function parseAmount(raw) {
  const value = sanitizeAmountInput(raw);
  if (value === null || value === '' || value === '.') return NaN;
  return Number(value);
}

/** Mitad de un gasto compartido, redondeada a centavos. */
export function splitShared(amount) {
  return roundCents(amount / 2);
}

const currencyFormatters = new Map();

export function formatCurrency(value, currency = 'MXN') {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  let fmt = currencyFormatters.get(currency);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat(LOCALE, { style: 'currency', currency });
    } catch {
      fmt = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    currencyFormatters.set(currency, fmt);
  }
  // Evita mostrar "-$0.00" por residuos de coma flotante.
  return fmt.format(Object.is(roundCents(n), -0) ? 0 : roundCents(n));
}

const numberFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Número con separador de miles y 2 decimales (para tablas). */
export function formatAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  const rounded = roundCents(n);
  return numberFormatter.format(Object.is(rounded, -0) ? 0 : rounded);
}

/** Porcentaje gastado de un presupuesto. Sin presupuesto y con gasto = 100%. */
export function budgetPercentage(budget, spent) {
  if (budget > 0) return (spent / budget) * 100;
  return spent > 0 ? 100 : 0;
}

/** Las columnas de montos son DECIMAL(10,2): máximo 99,999,999.99. */
export const MAX_AMOUNT = 100000000;
