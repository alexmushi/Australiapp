import { describe, it, expect } from 'vitest';
import {
  buildSummaryView,
  categoryColorMap,
  computeHistoryTotals,
  poolStatus,
  sortExpensesByDateDesc,
  spendingSegments,
} from './dashboard.js';

const report = {
  months: [{ year: 2025, month: 8 }],
  plan: { income: 4000, invest: 1200, save: 800, spending: 2000 },
  missingIncome: [],
  categories: [
    { id: 1, name: 'Renta', expenses: 1500 },
    { id: 2, name: 'Comida', expenses: 650.5 },
    { id: 3, name: 'Bus', expenses: 0 },
  ],
  expenses: [
    { id: 1, category_id: 1, amount: 1500, date: '2025-08-01T00:00:00.000Z', description: 'renta' },
    { id: 2, category_id: 2, amount: 400.25, date: '2025-08-03T00:00:00.000Z', description: null },
    { id: 3, category_id: 2, amount: 250.25, date: '2025-08-02T00:00:00.000Z', description: 'x' },
  ],
};

describe('poolStatus', () => {
  it('calcula lo restante', () => {
    expect(poolStatus(2000, 500)).toMatchObject({ percentage: 25, remaining: 1500, over: 0, isOver: false });
  });
  it('marca cuando se pasa', () => {
    expect(poolStatus(2000, 2150.5)).toMatchObject({ remaining: 0, isOver: true });
    expect(poolStatus(2000, 2150.5).over).toBeCloseTo(150.5);
  });
  it('sin dinero para gastos: 100% si hay gasto', () => {
    expect(poolStatus(0, 10).percentage).toBe(100);
    expect(poolStatus(0, 0).percentage).toBe(0);
  });
  it('no marca excedido por residuos de coma flotante', () => {
    expect(poolStatus(0.3, 0.1 + 0.2).isOver).toBe(false);
  });
});

describe('buildSummaryView', () => {
  it('resta todos los gastos del mismo 50%', () => {
    const v = buildSummaryView(report, ['all']);
    expect(v.pool).toBe(2000);
    expect(v.spent).toBeCloseTo(2150.5);
    expect(v.isOver).toBe(true);
    expect(v.over).toBeCloseTo(150.5);
    expect(v.categories.map((c) => c.name)).toEqual(['Renta', 'Comida', 'Bus']);
    expect(v.categories[0].shareOfPool).toBe(75);
    expect(v.categories[0].shareOfSpent).toBeCloseTo(69.75, 1);
    expect(v.isFiltered).toBe(false);
  });

  it('el filtro no cambia lo disponible, solo el desglose', () => {
    const v = buildSummaryView(report, ['2']);
    expect(v.spent).toBeCloseTo(2150.5);
    expect(v.over).toBeCloseTo(150.5);
    expect(v.filteredSpent).toBeCloseTo(650.5);
    expect(v.categories.map((c) => c.id)).toEqual([2]);
    expect(v.expenses.map((e) => e.id)).toEqual([2, 3]);
    expect(v.expenses[0].categoryName).toBe('Comida');
    expect(v.isFiltered).toBe(true);
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
    expect(categoryColorMap([...cats].reverse())).toEqual(map);
  });
});

describe('spendingSegments', () => {
  const cats = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `c${i + 1}`, expenses: (i + 1) * 10 }));
  it('agrupa el resto en "Otras" sin perder montos', () => {
    const segs = spendingSegments(cats, categoryColorMap(cats));
    expect(segs).toHaveLength(6);
    expect(segs[5].label).toBe('Otras (3)');
    expect(segs.reduce((s, x) => s + x.value, 0)).toBe(360);
    expect(segs.reduce((s, x) => s + x.share, 0)).toBeCloseTo(100);
    expect(segs[0].color).toBe('var(--series-8)');
  });
  it('ignora categorías sin gasto', () => {
    expect(spendingSegments([{ id: 1, name: 'a', expenses: 0 }], {})).toEqual([]);
  });
});

describe('computeHistoryTotals', () => {
  it('calcula diferencia, acumulado y totales', () => {
    const table = {
      months: [{ year: 2025, month: 6 }, { year: 2025, month: 7 }, { year: 2025, month: 8 }],
      plan: [
        { income: 0, invest: 0, save: 0, spending: 0, missing: true },
        { income: 20000, invest: 6000, save: 4000, spending: 10000 },
        { income: 25000, invest: 7500, save: 5000, spending: 12500 },
      ],
      spent: [100, 10300.5, 1175],
      categories: [],
    };
    const t = computeHistoryTotals(table);
    expect(t.diffs).toEqual([-100, -300.5, 11325]);
    expect(t.acumulados).toEqual([-100, -400.5, 10924.5]);
    expect(t.totals).toEqual({
      income: 45000,
      invest: 13500,
      save: 9000,
      spending: 22500,
      spent: 11575.5,
      diff: 10924.5,
    });
  });
});
