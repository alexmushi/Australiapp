import { Gasto } from '../models/gasto.model.js';

export async function createGasto(data) {
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
  const gasto = await Gasto.create({
    amount,
    currency_code,
    category_id,
    date,
    description,
    recurring,
    recurrence_type: recurring ? recurrence_type : null,
    recurrence_end_date: recurring ? recurrence_end_date : null,
  });
  return gasto.toJSON();
}
