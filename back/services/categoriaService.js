import { Categoria } from '../models/categoria.model.js';
import { Presupuesto } from '../models/presupuesto.model.js';

/**
 * Crea una categoría junto con sus presupuestos asociados.
 * @param {Object} data
 * @param {string} data.name
 * @param {string} [data.description]
 * @param {boolean} data.recurring
 * @param {string} [data.recurrence_end_date] - YYYY-MM-DD si es recurrente
 * @param {Array<{amount:number,period_month:number,period_year:number}>} data.budgets
 */
export async function createCategoryWithBudgets({
  name,
  description,
  recurring = false,
  recurrence_end_date = null,
  budgets = [],
}) {
  if (!name) {
    throw new Error('Name is required');
  }
  if (!Array.isArray(budgets) || budgets.length === 0) {
    throw new Error('At least one budget entry is required');
  }
  const category = await Categoria.create({ name, description });

  const records = budgets.map((b) => ({
    category_id: category.id,
    amount: b.amount,
    period_month: b.period_month,
    period_year: b.period_year,
    recurring,
    recurrence_end_date: recurring ? recurrence_end_date : null,
  }));

  await Presupuesto.bulkCreate(records);

  return category.toJSON();
}
