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

/** Cuánto del dinero para gastos (50%) se ha usado y cuánto queda o sobra. */
export function poolStatus(pool, spent) {
  const diff = pool - spent;
  return {
    pool,
    spent,
    percentage: pool > 0 ? (spent / pool) * 100 : spent > 0 ? 100 : 0,
    remaining: Math.max(diff, 0),
    over: Math.max(-diff, 0),
    isOver: diff < -0.004,
  };
}

/**
 * Vista del resumen. El reparto y lo disponible son globales (todas las
 * categorías comparten el mismo 50%); el filtro de categorías solo acota el
 * desglose, la dona y la lista de movimientos.
 */
export function buildSummaryView(report, selectedCategories) {
  const all = selectedCategories.includes('all');
  const selectedSet = new Set(all ? report.categories.map((c) => String(c.id)) : selectedCategories);
  const nameById = Object.fromEntries(report.categories.map((c) => [String(c.id), c.name]));
  const totalSpent = report.expenses.reduce((s, e) => s + e.amount, 0);
  const pool = report.plan.spending;

  const categories = report.categories
    .filter((c) => selectedSet.has(String(c.id)))
    .sort((a, b) => b.expenses - a.expenses || a.name.localeCompare(b.name, 'es'))
    .map((c) => ({
      ...c,
      shareOfSpent: totalSpent > 0 ? (c.expenses / totalSpent) * 100 : 0,
      shareOfPool: pool > 0 ? (c.expenses / pool) * 100 : 0,
    }));
  const expenses = report.expenses
    .filter((e) => selectedSet.has(String(e.category_id)))
    .map((e) => ({ ...e, categoryName: nameById[String(e.category_id)] ?? '' }));

  return {
    plan: report.plan,
    months: report.months,
    missingIncome: report.missingIncome ?? [],
    isFiltered: !all,
    categories,
    expenses,
    filteredSpent: expenses.reduce((s, e) => s + e.amount, 0),
    ...poolStatus(pool, totalSpent),
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

/**
 * Filas calculadas de la tabla histórica: diferencia mensual entre lo
 * disponible para gastos y lo gastado, su acumulado y los totales.
 */
export function computeHistoryTotals(table) {
  const sum = (arr) => arr.reduce((s, v) => s + v, 0);
  const diffs = table.months.map((_, i) => table.plan[i].spending - table.spent[i]);
  const acumulados = [];
  diffs.reduce((acc, val, i) => {
    acumulados[i] = acc + val;
    return acumulados[i];
  }, 0);
  return {
    diffs,
    acumulados,
    totals: {
      income: sum(table.plan.map((p) => p.income)),
      invest: sum(table.plan.map((p) => p.invest)),
      save: sum(table.plan.map((p) => p.save)),
      spending: sum(table.plan.map((p) => p.spending)),
      spent: sum(table.spent),
      diff: sum(diffs),
    },
  };
}
