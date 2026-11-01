import { Ingreso } from '../models/ingreso.model.js';
import { getDivisaRates } from './divisaService.js';
import { badRequest, notFound } from '../utils/errors.js';
import { parseMoney } from '../utils/money.js';
import { isValidPeriod } from '../utils/months.js';

const toJSON = (row) => {
  const r = row.toJSON ? row.toJSON() : row;
  return { ...r, amount: Number(r.amount) };
};

function parsePeriod(year, month) {
  const y = Number(year);
  const m = Number(month);
  if (!isValidPeriod(y, m)) throw badRequest('Periodo inválido');
  return { y, m };
}

export async function listIngresos() {
  const rows = await Ingreso.findAll({
    order: [
      ['period_year', 'DESC'],
      ['period_month', 'DESC'],
    ],
  });
  return rows.map(toJSON);
}

/** Crea o reemplaza el ingreso del mes indicado. */
export async function upsertIngreso(year, month, data = {}) {
  const { y, m } = parsePeriod(year, month);
  const amount = parseMoney(data.amount, 'El monto');
  if (amount.error) throw badRequest(amount.error);
  const currency = data.currency_code;
  const rates = await getDivisaRates();
  if (typeof currency !== 'string' || !(currency in rates)) throw badRequest('Divisa inválida');
  const description =
    typeof data.description === 'string' && data.description.trim()
      ? data.description.trim().slice(0, 255)
      : null;

  const values = { amount: amount.value, currency_code: currency, description };
  const existing = await Ingreso.findOne({ where: { period_year: y, period_month: m } });
  if (existing) {
    await existing.update(values);
    return toJSON(existing);
  }
  const created = await Ingreso.create({ ...values, period_year: y, period_month: m });
  return toJSON(created);
}

export async function deleteIngreso(year, month) {
  const { y, m } = parsePeriod(year, month);
  const deleted = await Ingreso.destroy({ where: { period_year: y, period_month: m } });
  if (!deleted) throw notFound('No hay ingreso registrado para ese mes');
  return { deleted: true };
}
