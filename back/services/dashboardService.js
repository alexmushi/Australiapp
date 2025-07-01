import { sequelize } from '../config/index.js';
import { QueryTypes } from 'sequelize';

function getPeriodDates(period) {
  const now = new Date();
  let start, end;
  switch (period) {
    case 'last_week':
      end = new Date(now);
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'last_year':
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
  }
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function getDashboardData(period = 'this_month') {
  const { start, end } = getPeriodDates(period);
  const query = `
    SELECT c.id, c.name,
      COALESCE(SUM(p.amount), 0) AS budget,
      COALESCE(SUM(g.amount), 0) AS expenses
    FROM categorias c
    LEFT JOIN presupuestos p ON p.category_id = c.id
      AND STR_TO_DATE(CONCAT(p.period_year,'-',LPAD(p.period_month,2,'0'),'-01'), '%Y-%m-%d')
        BETWEEN :start AND :end
    LEFT JOIN gastos g ON g.category_id = c.id
      AND g.date BETWEEN :start AND :end
    GROUP BY c.id, c.name
    ORDER BY c.name
  `;
  const rows = await sequelize.query(query, {
    replacements: { start, end },
    type: QueryTypes.SELECT,
  });
  let totalBudget = 0;
  let totalExpenses = 0;
  const categories = rows.map((r) => {
    const b = Number(r.budget);
    const e = Number(r.expenses);
    totalBudget += b;
    totalExpenses += e;
    return { id: r.id, name: r.name, budget: b, expenses: e };
  });
  return { categories, totalBudget, totalExpenses };
}

export { getPeriodDates };
