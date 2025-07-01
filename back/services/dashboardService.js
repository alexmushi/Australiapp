import { Categoria } from '../models/categoria.model.js';
import { Presupuesto } from '../models/presupuesto.model.js';
import { Gasto } from '../models/gasto.model.js';
import { Op, fn, col, literal } from 'sequelize';

function monthRange(start, end) {
  const months = [];
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (cur <= last) {
    months.push({ month: cur.getUTCMonth() + 1, year: cur.getUTCFullYear() });
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return months;
}

export async function getCategoryStats(startDate, endDate) {
  const categories = await Categoria.findAll({ attributes: ['id', 'name'], raw: true });
  const categoryIds = categories.map(c => c.id);

  const expenses = await Gasto.findAll({
    where: { date: { [Op.between]: [startDate, endDate] }, category_id: { [Op.in]: categoryIds } },
    attributes: ['category_id', [fn('SUM', col('amount')), 'total']],
    group: ['category_id'],
    raw: true,
  });

  const expenseMap = {};
  for (const e of expenses) {
    expenseMap[e.category_id] = parseFloat(e.total);
  }

  const presupuestos = await Presupuesto.findAll({ where: { category_id: { [Op.in]: categoryIds } }, raw: true });

  const months = monthRange(startDate, endDate);

  const budgetMap = {};
  for (const c of categories) budgetMap[c.id] = 0;

  for (const p of presupuestos) {
    for (const m of months) {
      const monthDate = new Date(Date.UTC(m.year, m.month - 1, 1));
      const startRec = new Date(Date.UTC(p.period_year, p.period_month - 1, 1));
      if (p.recurring) {
        const endRec = new Date(p.recurrence_end_date);
        if (startRec <= monthDate && endRec >= monthDate) {
          budgetMap[p.category_id] += parseFloat(p.amount);
        }
      } else {
        if (p.period_year === m.year && p.period_month === m.month) {
          budgetMap[p.category_id] += parseFloat(p.amount);
        }
      }
    }
  }

  return categories.map(c => ({
    id: c.id,
    name: c.name,
    budget: budgetMap[c.id] || 0,
    expenses: expenseMap[c.id] || 0,
  }));
}
