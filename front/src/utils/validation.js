import { isValidISODate } from './date.js';
import { MAX_AMOUNT, parseAmount } from './money.js';

/** Valida un texto de monto. Devuelve el mensaje de error o undefined. */
export function amountError(raw, { label = 'el monto' } = {}) {
  if (raw === '' || raw == null) return `Ingresa ${label}.`;
  const n = parseAmount(raw);
  if (!Number.isFinite(n) || n <= 0) return 'Ingresa un monto mayor a 0.';
  if (n >= MAX_AMOUNT) return 'El monto es demasiado grande.';
  return undefined;
}

export function validateExpense({ amount, currency, category, date, recurring, endDate }) {
  const errors = {};
  const a = amountError(amount);
  if (a) errors.amount = a;
  if (!currency) errors.currency = 'Elige una divisa.';
  if (!category) errors.category = 'Elige una categoría.';
  if (!isValidISODate(date)) errors.date = 'Ingresa una fecha válida.';
  if (recurring && endDate) {
    if (!isValidISODate(endDate)) errors.endDate = 'Ingresa una fecha válida.';
    else if (isValidISODate(date) && endDate < date)
      errors.endDate = 'Debe ser igual o posterior a la fecha del gasto.';
  }
  return errors;
}

export const hasErrors = (errors) =>
  Object.values(errors).some((v) =>
    Array.isArray(v) ? v.some((r) => Object.keys(r).length) : Boolean(v)
  );
