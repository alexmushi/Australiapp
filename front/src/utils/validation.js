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

const isYear = (y) => /^\d{4}$/.test(String(y)) && Number(y) >= 2000 && Number(y) <= 2100;

export function validateCategory({ name, currency, recurring, amount, startMonth, startYear, endMonth, endYear, budgets }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Ingresa un nombre.';
  if (!currency) errors.currency = 'Elige una divisa.';
  if (recurring) {
    const a = amountError(amount, { label: 'el monto mensual' });
    if (a) errors.amount = a;
    if (!isYear(startYear)) errors.startYear = 'Año inválido.';
    if (!isYear(endYear)) errors.endYear = 'Año inválido.';
    if (
      !errors.startYear &&
      !errors.endYear &&
      Number(endYear) * 12 + Number(endMonth) < Number(startYear) * 12 + Number(startMonth)
    ) {
      errors.endYear = 'El fin debe ser igual o posterior al inicio.';
    }
  } else {
    const rows = budgets.map((b) => {
      const e = {};
      const a = amountError(b.amount);
      if (a) e.amount = a;
      if (!isYear(b.year)) e.year = 'Año inválido.';
      return e;
    });
    const seen = new Map();
    budgets.forEach((b, i) => {
      const key = `${Number(b.year)}-${Number(b.month)}`;
      if (seen.has(key)) rows[i].month = 'Este mes ya está en la lista.';
      else seen.set(key, i);
    });
    if (rows.some((r) => Object.keys(r).length)) errors.budgets = rows;
  }
  return errors;
}

export const hasErrors = (errors) =>
  Object.values(errors).some((v) =>
    Array.isArray(v) ? v.some((r) => Object.keys(r).length) : Boolean(v)
  );
