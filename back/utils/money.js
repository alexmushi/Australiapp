/** Redondea a centavos evitando errores de coma flotante (5.005 -> 5.01). */
export function roundCents(value) {
  return Math.round(Number((Number(value) * 100).toPrecision(12))) / 100;
}

/** Las columnas de montos son DECIMAL(10,2): máximo 99,999,999.99. */
export const MAX_AMOUNT = 100000000;

/** Reparto del ingreso de un mes. */
export const PLAN_SPLIT = { invest: 0.3, save: 0.2, spending: 0.5 };

/**
 * Divide un ingreso en inversión (30%), ahorro (20%) y gastos (50%).
 * Inversión y ahorro se redondean a centavos y gastos es el resto, así las
 * tres partes siempre suman exactamente el ingreso.
 */
export function splitIncome(amount) {
  const income = roundCents(amount);
  const invest = roundCents(income * PLAN_SPLIT.invest);
  const save = roundCents(income * PLAN_SPLIT.save);
  const spending = roundCents(income - invest - save);
  return { income, invest, save, spending };
}

/**
 * Convierte entre divisas. `rates[code]` = unidades de `code` por 1 MXN
 * (así las guarda el cron de divisas).
 */
export function convert(amount, from, to, rates) {
  const val = parseFloat(amount);
  if (from === to) return val;
  if (from !== 'MXN' && !rates[from]) throw new Error(`Divisa sin tipo de cambio: ${from}`);
  if (to !== 'MXN' && !rates[to]) throw new Error(`Divisa sin tipo de cambio: ${to}`);
  const toMXN = from === 'MXN' ? val : val / rates[from];
  return to === 'MXN' ? toMXN : toMXN * rates[to];
}

/** Valida y normaliza un monto recibido por la API. */
export function parseMoney(value, field = 'amount') {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) {
    return { error: `${field} debe ser un número mayor a 0` };
  }
  if (n >= MAX_AMOUNT) return { error: `${field} es demasiado grande` };
  return { value: roundCents(n) };
}
