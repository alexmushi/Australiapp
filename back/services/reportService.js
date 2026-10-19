import { Op } from 'sequelize';
import { Categoria } from '../models/categoria.model.js';
import { Gasto } from '../models/gasto.model.js';
import { Ingreso } from '../models/ingreso.model.js';
import { getRateBook } from './divisaService.js';
import { badRequest } from '../utils/errors.js';
import { splitIncome } from '../utils/money.js';
import { isoDay } from '../utils/rates.js';
import {
  currentMonth,
  fromIndex,
  monthEndExclusive,
  monthIndex,
  monthOfDate,
  monthStart,
  monthsBetween,
  parseMonthParam,
} from '../utils/months.js';

const RANGES = ['month', 'year', 'all', 'custom'];
const EMPTY_PLAN = { income: 0, invest: 0, save: 0, spending: 0 };

const addPlans = (a, b) => ({
  income: a.income + b.income,
  invest: a.invest + b.invest,
  save: a.save + b.save,
  spending: a.spending + b.spending,
});

const firstDayISO = (year, month) => `${year}-${String(month).padStart(2, '0')}-01`;

/**
 * Reparto 30/20/50 de cada mes, convertido a la divisa pedida con el tipo de
 * cambio del primer día del mes que financia.
 */
function planByMonth(incomes, currency, book) {
  const map = new Map();
  for (const inc of incomes) {
    const split = splitIncome(inc.amount);
    const day = firstDayISO(inc.period_year, inc.period_month);
    const conv = (v) => book.convert(v, inc.currency_code, currency, day);
    map.set(monthIndex({ year: inc.period_year, month: inc.period_month }), {
      income: conv(split.income),
      invest: conv(split.invest),
      save: conv(split.save),
      spending: conv(split.spending),
    });
  }
  return map;
}

/** Meses que abarca un rango. `earliest` solo se usa para 'all'. */
export function resolveMonths(range, monthStr, now, earliest) {
  if (!RANGES.includes(range)) throw badRequest('Rango inválido');
  const current = currentMonth(now);
  switch (range) {
    case 'custom': {
      const period = parseMonthParam(monthStr);
      if (!period) throw badRequest('Mes inválido');
      return [period];
    }
    case 'year':
      return monthsBetween(fromIndex(monthIndex(current) - 11), current);
    case 'all': {
      const first = earliest && monthIndex(earliest) < monthIndex(current) ? earliest : current;
      return monthsBetween(first, current);
    }
    case 'month':
    default:
      return [current];
  }
}

/**
 * Resumen de un periodo: ingreso y su reparto, gasto total y por categoría.
 * Todos los gastos salen del mismo 50% sin importar la categoría.
 */
export async function getSummary(range = 'month', currency = 'MXN', monthStr, now = new Date()) {
  const current = currentMonth(now);
  const lastExclusive = range === 'custom' ? null : monthEndExclusive(current);

  // Para 'all' se necesita el primer mes con datos, así que se piden sin límite inferior.
  let months;
  let expensesAll;
  const incomesAll = await Ingreso.findAll();
  if (range === 'all') {
    expensesAll = await Gasto.findAll({
      where: { date: { [Op.lt]: lastExclusive } },
      order: [['date', 'ASC']],
    });
    const candidates = [
      ...expensesAll.map((e) => monthOfDate(e.date)),
      ...incomesAll.map((i) => ({ year: i.period_year, month: i.period_month })),
    ];
    const earliest = candidates.length
      ? fromIndex(Math.min(...candidates.map(monthIndex)))
      : null;
    months = resolveMonths(range, monthStr, now, earliest);
  } else {
    months = resolveMonths(range, monthStr, now);
    expensesAll = await Gasto.findAll({
      where: {
        date: { [Op.gte]: monthStart(months[0]), [Op.lt]: monthEndExclusive(months.at(-1)) },
      },
      order: [['date', 'ASC']],
    });
  }

  const book = await getRateBook();
  if (!book.has(currency)) throw badRequest('Divisa inválida');
  const monthSet = new Set(months.map(monthIndex));
  const plans = planByMonth(
    incomesAll.filter((i) => monthSet.has(monthIndex({ year: i.period_year, month: i.period_month }))),
    currency,
    book
  );
  const plan = [...plans.values()].reduce(addPlans, EMPTY_PLAN);
  const missingIncome = months.filter((m) => !plans.has(monthIndex(m)));

  const expenses = expensesAll.map((e) => ({
    id: e.id,
    category_id: e.category_id,
    // Cada gasto se convierte con el tipo de cambio de su fecha.
    amount: book.convert(e.amount, e.currency_code, currency, isoDay(e.date)),
    date: e.date,
    description: e.description,
  }));

  const categories = await Categoria.findAll({ attributes: ['id', 'name'] });
  const spentByCat = new Map();
  for (const e of expenses) spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + e.amount);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return {
    months,
    plan,
    missingIncome,
    totalExpenses,
    remaining: plan.spending - totalExpenses,
    categories: categories.map((c) => ({ id: c.id, name: c.name, expenses: spentByCat.get(c.id) ?? 0 })),
    expenses,
  };
}

/** Tabla histórica: ingreso, reparto y gasto por categoría de cada mes. */
export async function getHistoricalTable(currency = 'MXN', now = new Date()) {
  const current = currentMonth(now);
  const categories = await Categoria.findAll({ attributes: ['id', 'name'] });
  const incomesAll = await Ingreso.findAll();
  const expensesAll = await Gasto.findAll({
    where: { date: { [Op.lt]: monthEndExclusive(current) } },
    attributes: ['amount', 'currency_code', 'category_id', 'date'],
  });
  const book = await getRateBook();
  if (!book.has(currency)) throw badRequest('Divisa inválida');

  const incomes = incomesAll.filter(
    (i) => monthIndex({ year: i.period_year, month: i.period_month }) <= monthIndex(current)
  );
  const indices = [
    monthIndex(current),
    ...incomes.map((i) => monthIndex({ year: i.period_year, month: i.period_month })),
    ...expensesAll.map((e) => monthIndex(monthOfDate(e.date))),
  ];
  const months = monthsBetween(fromIndex(Math.min(...indices)), current);
  const first = monthIndex(months[0]);

  const plans = planByMonth(incomes, currency, book);
  const planRows = months.map((m) => plans.get(monthIndex(m)) ?? { ...EMPTY_PLAN, missing: true });

  const rows = new Map(categories.map((c) => [c.id, months.map(() => 0)]));
  const spentRow = months.map(() => 0);
  for (const e of expensesAll) {
    const idx = monthIndex(monthOfDate(e.date)) - first;
    const amount = book.convert(e.amount, e.currency_code, currency, isoDay(e.date));
    if (!rows.has(e.category_id)) rows.set(e.category_id, months.map(() => 0));
    rows.get(e.category_id)[idx] += amount;
    spentRow[idx] += amount;
  }

  return {
    months,
    plan: planRows,
    spent: spentRow,
    categories: categories.map((c) => {
      const values = rows.get(c.id);
      return { id: c.id, name: c.name, months: values, total: values.reduce((s, v) => s + v, 0) };
    }),
  };
}

/**
 * Estado de un mes y de los dos anteriores: dinero para gastos, gastado y si
 * se excedió. Lo usan el aviso al registrar gastos y las notificaciones.
 */
export async function getMonthStatus(monthStr, currency = 'MXN', now = new Date()) {
  const target = monthStr ? parseMonthParam(monthStr) : currentMonth(now);
  if (!target) throw badRequest('Mes inválido');
  const toStr = (m) => `${m.year}-${String(m.month).padStart(2, '0')}`;
  const periods = [-2, -1, 0].map((d) => fromIndex(monthIndex(target) + d));
  const summaries = [];
  for (const p of periods) summaries.push(await getSummary('custom', currency, toStr(p), now));

  const status = (p, s) => ({
    year: p.year,
    month: p.month,
    hasIncome: s.missingIncome.length === 0,
    income: s.plan.income,
    spending: s.plan.spending,
    spent: s.totalExpenses,
    remaining: s.plan.spending - s.totalExpenses,
    over: s.missingIncome.length === 0 && s.totalExpenses - s.plan.spending > 0.004,
    byCategory: Object.fromEntries(s.categories.filter((c) => c.expenses > 0).map((c) => [c.id, c.expenses])),
  });
  const [twoAgo, oneAgo, current] = periods.map((p, i) => status(p, summaries[i]));
  return {
    ...current,
    previous: [twoAgo, oneAgo],
    overspentStreak: twoAgo.over && oneAgo.over,
  };
}
