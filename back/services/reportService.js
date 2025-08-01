import { Categoria } from '../models/categoria.model.js';
import { Presupuesto } from '../models/presupuesto.model.js';
import { Gasto } from '../models/gasto.model.js';
import { Op } from 'sequelize';
import { getDivisaRates } from './divisaService.js';

function monthsBetween(start, end) {
  return (
    end.getFullYear() * 12 + end.getMonth() -
    (start.getFullYear() * 12 + start.getMonth())
  ) + 1;
}

function convert(amount, from, to, rates) {
  const val = parseFloat(amount);
  if (from === to) return val;
  const toMXN = from === 'MXN' ? val : val / rates[from];
  return to === 'MXN' ? toMXN : toMXN * rates[to];
}

export async function getSummary(range = 'month', currency = 'MXN', monthStr) {
  const now = new Date();
  if (range === 'custom' && monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    if (!Number.isNaN(y) && !Number.isNaN(m)) {
      now.setFullYear(y);
      now.setMonth(m - 1);
    }
  }
  let start;
  let end = new Date(now);

  switch (range) {
    case 'week': {
      start = new Date(now);
      const day = start.getDay();
      const diffToMonday = (day + 6) % 7;
      start.setDate(start.getDate() - diffToMonday);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    }
    case 'all':
      start = new Date(0);
      end = new Date();
      break;
    case 'year':
      start = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
      break;
    case 'custom':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'month':
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const categories = await Categoria.findAll({ attributes: ['id', 'name'] });
  const expensesAll = await Gasto.findAll({
    where: { date: { [Op.between]: [start, end] } },
    attributes: ['id', 'amount', 'currency_code', 'category_id', 'date', 'description'],
    order: [['date', 'ASC']],
  });

  const rates = await getDivisaRates();

  const result = [];
  let totalBudget = 0;
  let totalExpenses = 0;

  const DAY = 24 * 60 * 60 * 1000;

  for (const cat of categories) {
    const budgets = await Presupuesto.findAll({ where: { category_id: cat.id } });
    let budget = 0;
    for (const b of budgets) {
      const recordStart = new Date(b.period_year, b.period_month - 1, 1);
      const amountConv = convert(b.amount, b.currency_code, currency, rates);
      if (b.recurring) {
        const recEnd = b.recurrence_end_date ? new Date(b.recurrence_end_date) : end;
        if (recEnd >= start && end >= recordStart) {
          const effectiveStart = start > recordStart ? start : recordStart;
          const effectiveEnd = end < recEnd ? end : recEnd;
          if (range === 'week') {
            let m = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), 1);
            while (m <= effectiveEnd) {
              const monthStart = new Date(m.getFullYear(), m.getMonth(), 1);
              const monthEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
              const os = effectiveStart > monthStart ? effectiveStart : monthStart;
              const oe = effectiveEnd < monthEnd ? effectiveEnd : monthEnd;
              if (os <= oe) {
                const daysInMonth = monthEnd.getDate();
                const overlapDays = Math.floor((oe - os) / DAY) + 1;
                budget += (overlapDays / daysInMonth) * amountConv;
              }
              m.setMonth(m.getMonth() + 1);
            }
          } else {
            const months = monthsBetween(effectiveStart, effectiveEnd);
            budget += months * amountConv;
          }
        }
      } else {
        const recordEnd = new Date(b.period_year, b.period_month, 0);
        if (recordEnd >= start && recordStart <= end) {
          const effectiveStart = start > recordStart ? start : recordStart;
          const effectiveEnd = end < recordEnd ? end : recordEnd;
          if (range === 'week') {
            const daysInMonth = recordEnd.getDate();
            const overlapDays = Math.floor((effectiveEnd - effectiveStart) / DAY) + 1;
            if (overlapDays > 0) {
              budget += (overlapDays / daysInMonth) * amountConv;
            }
          } else if (effectiveStart <= effectiveEnd) {
            budget += amountConv;
          }
        }
      }
    }

    const catExpenses = expensesAll.filter((e) => e.category_id === cat.id);
    const spent = catExpenses.reduce(
      (sum, e) => sum + convert(e.amount, e.currency_code, currency, rates),
      0
    );
    totalBudget += budget;
    totalExpenses += spent;
    result.push({ id: cat.id, name: cat.name, budget, expenses: spent });
  }

  return {
    categories: result,
    totalBudget,
    totalExpenses,
    expenses: expensesAll.map((e) => ({
      id: e.id,
      category_id: e.category_id,
      amount: convert(e.amount, e.currency_code, currency, rates),
      date: e.date,
      description: e.description,
    })),
  };
}

export async function getCategoryDetail(
  id,
  range = 'month',
  currency = 'MXN',
  monthStr
) {
  const summary = await getSummary(range, currency, monthStr);
  const cat = summary.categories.find((c) => c.id === Number(id));
  if (!cat) throw new Error('Categoria no encontrada');
  const expenses = summary.expenses.filter((e) => e.category_id === Number(id));
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return {
    id: cat.id,
    name: cat.name,
    budget: cat.budget,
    expenses: { total, items: expenses },
  };
}

export async function getHistoricalTable(currency = 'MXN') {
  const start = new Date(2025, 5, 1); // Junio 2025
  const end = new Date(2026, 5, 1); // Junio 2026 inclusive

  const categories = await Categoria.findAll({ attributes: ['id', 'name'] });
  const budgetsAll = await Presupuesto.findAll();
  const expensesAll = await Gasto.findAll({
    where: { date: { [Op.lte]: end } },
    attributes: ['amount', 'currency_code', 'category_id', 'date'],
  });

  const rates = await getDivisaRates();

  // build months array
  const months = [];
  const mstart = new Date(start);
  while (mstart <= end) {
    months.push({ year: mstart.getFullYear(), month: mstart.getMonth() + 1 });
    mstart.setMonth(mstart.getMonth() + 1);
  }

  function monthIndex(date) {
    return (
      date.getFullYear() * 12 + date.getMonth() -
      (start.getFullYear() * 12 + start.getMonth())
    );
  }

  const table = categories.map((cat) => {
    const rows = months.map(() => ({ budget: 0, real: 0 }));
    let antesBudget = 0;
    let antesReal = 0;

    const catBudgets = budgetsAll.filter((b) => b.category_id === cat.id);
    for (const b of catBudgets) {
      const recordStart = new Date(b.period_year, b.period_month - 1, 1);
      const amount = convert(b.amount, b.currency_code, currency, rates);
      let recEnd = b.recurring ? b.recurrence_end_date || end : recordStart;
      recEnd = new Date(recEnd);
      for (let d = new Date(recordStart); d <= recEnd; d.setMonth(d.getMonth() + 1)) {
        if (d < start) {
          antesBudget += amount;
        } else if (d <= end) {
          const idx = monthIndex(d);
          if (idx >= 0 && idx < rows.length) rows[idx].budget += amount;
        }
        if (!b.recurring) break;
      }
    }

    const catExpenses = expensesAll.filter((e) => e.category_id === cat.id);
    for (const e of catExpenses) {
      const d = new Date(e.date);
      const amount = convert(e.amount, e.currency_code, currency, rates);
      if (d < start) {
        antesReal += amount;
      } else {
        const idx = monthIndex(new Date(d.getFullYear(), d.getMonth(), 1));
        if (idx >= 0 && idx < rows.length) rows[idx].real += amount;
      }
    }

    const totalBudget = antesBudget + rows.reduce((s, r) => s + r.budget, 0);
    const totalReal = antesReal + rows.reduce((s, r) => s + r.real, 0);

    return { id: cat.id, name: cat.name, antesBudget, antesReal, months: rows, totalBudget, totalReal };
  });

  return { start: { year: start.getFullYear(), month: start.getMonth() + 1 }, months, categories: table };
}