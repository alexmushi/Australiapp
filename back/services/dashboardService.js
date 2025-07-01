import { Categoria } from '../models/categoria.model.js';
import { Presupuesto } from '../models/presupuesto.model.js';
import { Gasto } from '../models/gasto.model.js';
import { Op } from 'sequelize';

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getDashboardData(startDate, endDate) {
  const categories = await Categoria.findAll({ attributes: ['id', 'name'] });
  const result = [];
  for (const cat of categories) {
    const presupuestos = await Presupuesto.findAll({
      where: { category_id: cat.id },
    });
    let budget = 0;
    for (const p of presupuestos) {
      if (p.recurring) {
        let current = new Date(p.period_year, p.period_month - 1, 1);
        const endRec = p.recurrence_end_date || endDate;
        while (current <= endRec) {
          if (current >= monthStart(startDate) && current <= monthStart(endDate)) {
            budget += parseFloat(p.amount);
          }
          current.setMonth(current.getMonth() + 1);
        }
      } else {
        const dt = new Date(p.period_year, p.period_month - 1, 1);
        if (dt >= monthStart(startDate) && dt <= monthStart(endDate)) {
          budget += parseFloat(p.amount);
        }
      }
    }
    const expenses =
      (await Gasto.sum('amount', {
        where: {
          category_id: cat.id,
          date: { [Op.between]: [startDate, endDate] },
        },
      })) || 0;
    result.push({ id: cat.id, name: cat.name, budget, expenses });
  }
  const totalBudget = result.reduce((a, c) => a + c.budget, 0);
  const totalExpenses = result.reduce((a, c) => a + c.expenses, 0);
  return { categories: result, totalBudget, totalExpenses };
}
