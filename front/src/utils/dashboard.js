import { budgetPercentage } from './money.js';

export const SERIES_COUNT = 8;

/**
 * Asigna a cada categoría un color fijo según su posición en la lista completa,
 * para que filtrar no cambie el color de las demás. Más allá de 8 se usa "otros".
 */
export function categoryColorMap(categories) {
  const sorted = [...categories].sort((a, b) => Number(a.id) - Number(b.id));
  return Object.fromEntries(
    sorted.map((c, i) => [String(c.id), i < SERIES_COUNT ? `var(--series-${i + 1})` : 'var(--series-other)'])
  );
}

/** Estado de un presupuesto: porcentaje usado y cuánto queda o sobra. */
export function budgetStatus(budget, spent) {
  const diff = budget - spent;
  return {
    budget,
    spent,
    percentage: budgetPercentage(budget, spent),
    remaining: Math.max(diff, 0),
    over: Math.max(-diff, 0),
    isOver: diff < 0,
  };
}

/**
 * Vista del resumen (todas o varias categorías). Mismos totales que el reporte
 * del servidor, limitados a las categorías seleccionadas.
 */
export function buildSummaryView(report, selectedCategories) {
  const all = selectedCategories.includes('all');
  const selectedSet = new Set(all ? report.categories.map((c) => String(c.id)) : selectedCategories);
  const categories = report.categories
    .filter((c) => selectedSet.has(String(c.id)))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const nameById = Object.fromEntries(report.categories.map((c) => [String(c.id), c.name]));
  const expenses = report.expenses
    .filter((e) => selectedSet.has(String(e.category_id)))
    .map((e) => ({ ...e, categoryName: nameById[String(e.category_id)] ?? '' }));
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const totalExpenses = categories.reduce((s, c) => s + c.expenses, 0);
  return { categories, expenses, ...budgetStatus(totalBudget, totalExpenses) };
}

/** Vista de una sola categoría (respuesta de /reports/category/:id). */
export function buildCategoryView(report) {
  const expenses = report.expenses.items.map((e) => ({ ...e, categoryName: report.name }));
  return {
    categories: [
      { id: report.id, name: report.name, budget: report.budget, expenses: report.expenses.total },
    ],
    expenses,
    ...budgetStatus(report.budget, report.expenses.total),
  };
}

/** Gastos del más reciente al más antiguo (a igual fecha, el último registrado primero). */
export function sortExpensesByDateDesc(expenses) {
  return [...expenses].sort((a, b) => {
    const da = String(a.date).slice(0, 10);
    const db = String(b.date).slice(0, 10);
    if (da !== db) return da < db ? 1 : -1;
    return (b.id ?? 0) - (a.id ?? 0);
  });
}

/**
 * Segmentos de la dona de distribución: hasta `max` categorías con gasto y el
 * resto agrupado en "Otras". Los montos no se alteran, solo se agrupan.
 */
export function spendingSegments(categories, colorMap, max = 5) {
  const withSpend = categories.filter((c) => c.expenses > 0).sort((a, b) => b.expenses - a.expenses);
  const total = withSpend.reduce((s, c) => s + c.expenses, 0);
  const shown = withSpend.length > max + 1 ? withSpend.slice(0, max) : withSpend;
  const rest = withSpend.slice(shown.length);
  const segments = shown.map((c) => ({
    key: String(c.id),
    label: c.name,
    value: c.expenses,
    color: colorMap[String(c.id)] ?? 'var(--series-other)',
  }));
  if (rest.length) {
    segments.push({
      key: 'other',
      label: `Otras (${rest.length})`,
      value: rest.reduce((s, c) => s + c.expenses, 0),
      color: 'var(--series-other)',
    });
  }
  return segments.map((s) => ({ ...s, share: total > 0 ? (s.value / total) * 100 : 0 }));
}

/** Totales, diferencias mensuales y acumulado de la tabla histórica. */
export function computeHistoryTotals(table) {
  const sum = (fn) => table.categories.reduce((s, c) => s + fn(c), 0);
  const antesBudget = sum((c) => c.antesBudget);
  const antesReal = sum((c) => c.antesReal);
  const monthTotals = table.months.map((_, idx) => ({
    budget: sum((c) => c.months[idx].budget),
    real: sum((c) => c.months[idx].real),
  }));
  const totalBudget = sum((c) => c.totalBudget);
  const totalReal = sum((c) => c.totalReal);
  const mensualDiffs = [antesBudget - antesReal, ...monthTotals.map((m) => m.budget - m.real)];
  const acumulados = [];
  mensualDiffs.reduce((acc, val, idx) => {
    acumulados[idx] = acc + val;
    return acumulados[idx];
  }, 0);
  return { antesBudget, antesReal, monthTotals, totalBudget, totalReal, mensualDiffs, acumulados };
}
