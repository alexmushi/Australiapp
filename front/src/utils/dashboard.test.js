import { describe, it, expect } from 'vitest';
import {
  buildCategoryView,
  buildSummaryView,
  categoryColorMap,
  computeHistoryTotals,
  sortExpensesByDateDesc,
  spendingSegments,
} from './dashboard.js';

const report = {
  categories: [
    { id: 1, name: 'Renta', budget: 1000, expenses: 1000 },
    { id: 2, name: 'Comida', budget: 500, expenses: 650.5 },
    { id: 3, name: 'Bus', budget: 100, expenses: 0 },
  ],
  expenses: [
    { id: 1, category_id: 1, amount: 1000, date: '2025-07-01T00:00:00.000Z', description: 'renta' },
    { id: 2, category_id: 2, amount: 400.25, date: '2025-07-03T00:00:00.000Z', description: null },
    { id: 3, category_id: 2, amount: 250.25, date: '2025-07-02T00:00:00.000Z', description: 'x' },
  ],
};

describe('buildSummaryView', () => {
  it('suma todas las categorías', () => {
    const v = buildSummaryView(report, ['all']);
    expect(v.budget).toBe(1600);
    expect(v.spent).toBeCloseTo(1650.5);
    expect(v.isOver).toBe(true);
    expect(v.over).toBeCloseTo(50.5);
    expect(v.remaining).toBe(0);
    expect(v.expenses).toHaveLength(3);
    expect(v.categories.map((c) => c.name)).toEqual(['Bus', 'Comida', 'Renta']);
  });
  it('filtra por categorías seleccionadas', () => {
    const v = buildSummaryView(report, ['1', '3']);
    expect(v.budget).toBe(1100);
    expect(v.spent).toBe(1000);
    expect(v.remaining).toBe(100);
    expect(v.isOver).toBe(false);
    expect(v.expenses.map((e) => e.id)).toEqual([1]);
    expect(v.expenses[0].categoryName).toBe('Renta');
  });
});

describe('buildCategoryView', () => {
  it('usa presupuesto y total de la categoría', () => {
    const v = buildCategoryView({
      id: 2,
      name: 'Comida',
      budget: 500,
      expenses: { total: 650.5, items: report.expenses.slice(1) },
    });
    expect(v.budget).toBe(500);
    expect(v.spent).toBe(650.5);
    expect(v.percentage).toBeCloseTo(130.1);
    expect(v.expenses.every((e) => e.categoryName === 'Comida')).toBe(true);
  });
});

describe('sortExpensesByDateDesc', () => {
  it('ordena del más reciente al más antiguo', () => {
    expect(sortExpensesByDateDesc(report.expenses).map((e) => e.id)).toEqual([2, 3, 1]);
  });
});

describe('categoryColorMap', () => {
  it('asigna colores estables por id y "otros" después de 8', () => {
    const cats = Array.from({ length: 10 }, (_, i) => ({ id: 10 - i, name: `c${i}` }));
    const map = categoryColorMap(cats);
    expect(map['1']).toBe('var(--series-1)');
    expect(map['8']).toBe('var(--series-8)');
    expect(map['9']).toBe('var(--series-other)');
    // El orden de entrada no cambia la asignación
    expect(categoryColorMap([...cats].reverse())).toEqual(map);
  });
});

describe('spendingSegments', () => {
  const cats = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `c${i + 1}`, budget: 0, expenses: (i + 1) * 10 }));
  it('agrupa el resto en "Otras" sin perder montos', () => {
    const segs = spendingSegments(cats, categoryColorMap(cats));
    expect(segs).toHaveLength(6);
    expect(segs[5].label).toBe('Otras (3)');
    const total = segs.reduce((s, x) => s + x.value, 0);
    expect(total).toBe(360);
    expect(segs.reduce((s, x) => s + x.share, 0)).toBeCloseTo(100);
    expect(segs[0].color).toBe('var(--series-8)');
  });
  it('no agrupa si solo sobra una categoría', () => {
    expect(spendingSegments(cats.slice(0, 6), {}).map((s) => s.label)).not.toContain('Otras (1)');
  });
  it('ignora categorías sin gasto', () => {
    expect(spendingSegments([{ id: 1, name: 'a', budget: 5, expenses: 0 }], {})).toEqual([]);
  });
});

// Implementación original de Dashboard.jsx, para comprobar que el refactor da lo mismo.
function originalTotals(table) {
  const antesBudget = table.categories.reduce((s, c) => s + c.antesBudget, 0);
  const antesReal = table.categories.reduce((s, c) => s + c.antesReal, 0);
  const monthTotals = table.months.map((_, idx) => ({
    budget: table.categories.reduce((s, c) => s + c.months[idx].budget, 0),
    real: table.categories.reduce((s, c) => s + c.months[idx].real, 0),
  }));
  const totalBudget = table.categories.reduce((s, c) => s + c.totalBudget, 0);
  const totalReal = table.categories.reduce((s, c) => s + c.totalReal, 0);
  const mensualDiffs = [antesBudget - antesReal, ...monthTotals.map((m) => m.budget - m.real)];
  const acumulados = [];
  mensualDiffs.reduce((acc, val, idx) => {
    const sum = acc + val;
    acumulados[idx] = sum;
    return sum;
  }, 0);
  return { antesBudget, antesReal, monthTotals, totalBudget, totalReal, mensualDiffs, acumulados };
}

describe('computeHistoryTotals', () => {
  it('coincide con el cálculo original', () => {
    const table = {
      months: [{ year: 2025, month: 6 }, { year: 2025, month: 7 }, { year: 2025, month: 8 }],
      categories: [
        { id: 1, antesBudget: 100, antesReal: 80, months: [{ budget: 50, real: 70 }, { budget: 50, real: 10.1 }, { budget: 50, real: 0 }], totalBudget: 250, totalReal: 160.1 },
        { id: 2, antesBudget: 0, antesReal: 15.5, months: [{ budget: 20, real: 5 }, { budget: 20, real: 25 }, { budget: 0, real: 3.3 }], totalBudget: 40, totalReal: 48.8 },
      ],
    };
    const t = computeHistoryTotals(table);
    expect(t).toEqual(originalTotals(table));
    expect(t.mensualDiffs[0]).toBeCloseTo(4.5);
    expect(t.acumulados[3]).toBeCloseTo(t.totalBudget - t.totalReal);
  });
});
