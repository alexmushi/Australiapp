import { Categoria } from '../models/categoria.model.js';
import { Presupuesto } from '../models/presupuesto.model.js';
import { Gasto } from '../models/gasto.model.js';
import { Op } from 'sequelize';

function monthsBetween(start, end) {
  return (
    end.getFullYear() * 12 + end.getMonth() -
    (start.getFullYear() * 12 + start.getMonth())
  ) + 1;
}

export async function getSummary(range = 'month') {
  const now = new Date();
  let start;
  let end = new Date();

  switch (range) {
    case 'week':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case 'year':
      start = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
      break;
    case 'month':
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const categories = await Categoria.findAll({ attributes: ['id', 'name'] });
  const result = [];
  let totalBudget = 0;
  let totalExpenses = 0;

  for (const cat of categories) {
    const budgets = await Presupuesto.findAll({ where: { category_id: cat.id } });
    let budget = 0;
    for (const b of budgets) {
      const recordStart = new Date(b.period_year, b.period_month - 1, 1);
      if (b.recurring) {
        const recEnd = b.recurrence_end_date || end;
        if (recEnd >= start && end >= recordStart) {
          const effectiveStart = start > recordStart ? start : recordStart;
          const effectiveEnd = end < recEnd ? end : recEnd;
          const months = monthsBetween(effectiveStart, effectiveEnd);
          budget += months * parseFloat(b.amount);
        }
      } else {
        if (recordStart >= start && recordStart <= end) {
          budget += parseFloat(b.amount);
        }
      }
    }

    const expenses = await Gasto.sum('amount', {
      where: {
        category_id: cat.id,
        date: { [Op.between]: [start, end] },
      },
    });

    const spent = parseFloat(expenses || 0);
    totalBudget += budget;
    totalExpenses += spent;
    result.push({ id: cat.id, name: cat.name, budget, expenses: spent });
  }

  return {
    categories: result,
    totalBudget,
    totalExpenses,
  };
}
