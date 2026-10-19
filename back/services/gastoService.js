import { Gasto } from '../models/gasto.model.js';
import { Categoria } from '../models/categoria.model.js';
import { getDivisaRates } from './divisaService.js';
import { badRequest } from '../utils/errors.js';
import { parseMoney } from '../utils/money.js';
import { isValidISODate } from '../utils/months.js';

const RECURRENCE_TYPES = ['weekly', 'monthly'];

export async function createGasto(data = {}) {
  const {
    amount,
    currency_code,
    category_id,
    date,
    description,
    recurring = false,
    recurrence_type,
    recurrence_end_date,
  } = data;

  const parsed = parseMoney(amount, 'El monto');
  if (parsed.error) throw badRequest(parsed.error);
  if (!isValidISODate(date)) throw badRequest('Fecha inválida');
  const rates = await getDivisaRates();
  if (typeof currency_code !== 'string' || !(currency_code in rates)) throw badRequest('Divisa inválida');
  if (!Number.isInteger(Number(category_id)) || !(await Categoria.findByPk(Number(category_id)))) {
    throw badRequest('Categoría inválida');
  }
  if (typeof recurring !== 'boolean') throw badRequest('recurring debe ser booleano');
  if (recurring) {
    if (!RECURRENCE_TYPES.includes(recurrence_type)) throw badRequest('Tipo de recurrencia inválido');
    if (recurrence_end_date != null) {
      if (!isValidISODate(recurrence_end_date)) throw badRequest('Fecha fin inválida');
      if (recurrence_end_date < date) throw badRequest('La fecha fin es anterior a la fecha del gasto');
    }
  }
  if (description != null && (typeof description !== 'string' || description.length > 255)) {
    throw badRequest('Descripción inválida');
  }

  const gasto = await Gasto.create({
    amount: parsed.value,
    currency_code,
    category_id: Number(category_id),
    date,
    description: description?.trim() || null,
    recurring,
    recurrence_type: recurring ? recurrence_type : null,
    recurrence_end_date: recurring ? recurrence_end_date ?? null : null,
  });

  return gasto.toJSON();
}
