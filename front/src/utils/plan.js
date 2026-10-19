import { roundCents } from './money.js';

/** Reparto del ingreso (debe coincidir con back/utils/money.js). */
export const PLAN_SPLIT = { invest: 0.3, save: 0.2, spending: 0.5 };

export const PLAN_LABELS = {
  invest: 'Invertir',
  save: 'Ahorrar',
  spending: 'Para gastos',
};

/**
 * Divide un ingreso en 30/20/50. Inversión y ahorro se redondean a centavos y
 * gastos es el resto, así las tres partes siempre suman el ingreso.
 */
export function splitIncome(amount) {
  const income = roundCents(amount);
  const invest = roundCents(income * PLAN_SPLIT.invest);
  const save = roundCents(income * PLAN_SPLIT.save);
  const spending = roundCents(income - invest - save);
  return { income, invest, save, spending };
}
