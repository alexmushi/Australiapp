/**
 * Serie mensual para la gráfica de barras a partir de la tabla histórica.
 * Con todas las categorías incluye el 50% para gastos como referencia; con un
 * filtro, solo lo gastado en las categorías elegidas.
 */
export function monthlySeries(table, selectedCategories, max = 12) {
  const all = selectedCategories.includes('all');
  const start = Math.max(0, table.months.length - max);
  const months = table.months.slice(start);
  const pick = (arr) => arr.slice(start);

  if (all) {
    return {
      months,
      spent: pick(table.spent),
      pool: pick(table.plan.map((p) => (p.missing ? null : p.spending))),
    };
  }
  const selected = new Set(selectedCategories);
  const cats = table.categories.filter((c) => selected.has(String(c.id)));
  const spent = table.months.map((_, i) => cats.reduce((s, c) => s + (c.months[i] ?? 0), 0));
  return { months, spent: pick(spent), pool: null, names: cats.map((c) => c.name) };
}
