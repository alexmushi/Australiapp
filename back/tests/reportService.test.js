import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db, resetDb } from './mockDb.js';

vi.mock('../models/categoria.model.js', async () => ({ Categoria: (await import('./mockDb.js')).model('categorias') }));
vi.mock('../models/gasto.model.js', async () => ({ Gasto: (await import('./mockDb.js')).model('gastos') }));
vi.mock('../models/ingreso.model.js', async () => ({ Ingreso: (await import('./mockDb.js')).model('ingresos') }));
// Unidades de cada divisa por 1 MXN.
vi.mock('../services/divisaService.js', () => ({
  getDivisaRates: vi.fn(async () => ({ MXN: 1, AUD: 0.08 })),
}));

const { getSummary, getHistoricalTable } = await import('../services/reportService.js');

const d = (iso) => new Date(`${iso}T00:00:00.000Z`);
// 15 ago 2025 en Sídney
const NOW = new Date('2025-08-15T02:00:00Z');

beforeEach(() => {
  resetDb();
  db.categorias = [
    { id: 1, name: 'Comida' },
    { id: 2, name: 'Transporte' },
  ];
  db.ingresos = [
    { id: 1, period_year: 2025, period_month: 7, amount: '20000.00', currency_code: 'MXN' },
    { id: 2, period_year: 2025, period_month: 8, amount: '2000.00', currency_code: 'AUD' }, // 25,000 MXN
  ];
  db.gastos = [
    { id: 1, amount: '100.00', currency_code: 'MXN', category_id: 1, date: d('2025-06-30'), description: 'junio' },
    { id: 2, amount: '300.00', currency_code: 'MXN', category_id: 1, date: d('2025-07-31'), description: 'fin julio' },
    { id: 3, amount: '1000.00', currency_code: 'MXN', category_id: 1, date: d('2025-08-01'), description: 'inicio agosto' },
    { id: 4, amount: '10.00', currency_code: 'AUD', category_id: 2, date: d('2025-08-10'), description: null },
    { id: 5, amount: '50.00', currency_code: 'MXN', category_id: 2, date: d('2025-08-31'), description: 'fin agosto' },
    { id: 6, amount: '70.00', currency_code: 'MXN', category_id: 2, date: d('2025-09-01'), description: 'futuro' },
  ];
});

describe('getSummary', () => {
  it('calcula el reparto del mes y resta todos los gastos del 50%', async () => {
    const s = await getSummary('month', 'MXN', undefined, NOW);
    expect(s.months).toEqual([{ year: 2025, month: 8 }]);
    expect(s.plan.income).toBeCloseTo(25000);
    expect(s.plan.invest).toBeCloseTo(7500);
    expect(s.plan.save).toBeCloseTo(5000);
    expect(s.plan.spending).toBeCloseTo(12500);
    expect(s.missingIncome).toEqual([]);
    // 1000 + 10 AUD (125) + 50, todo el mes calendario
    expect(s.totalExpenses).toBeCloseTo(1175);
    expect(s.remaining).toBeCloseTo(11325);
    expect(s.expenses.map((e) => e.id)).toEqual([3, 4, 5]);
    expect(s.categories).toEqual([
      { id: 1, name: 'Comida', expenses: 1000 },
      { id: 2, name: 'Transporte', expenses: expect.closeTo(175, 6) },
    ]);
  });

  it('asigna los gastos del primer y último día al mes correcto', async () => {
    const julio = await getSummary('custom', 'MXN', '2025-07', NOW);
    expect(julio.expenses.map((e) => e.id)).toEqual([2]);
    expect(julio.plan.spending).toBeCloseTo(10000);
    const junio = await getSummary('custom', 'MXN', '2025-06', NOW);
    expect(junio.expenses.map((e) => e.id)).toEqual([1]);
  });

  it('asigna meses igual en cualquier zona horaria del servidor', async () => {
    const original = process.env.TZ;
    try {
      for (const tz of ['UTC', 'Australia/Sydney', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
        process.env.TZ = tz;
        const s = await getSummary('custom', 'MXN', '2025-07', NOW);
        expect(s.expenses.map((e) => e.id), tz).toEqual([2]);
      }
    } finally {
      process.env.TZ = original;
    }
  });

  it('reporta los meses sin ingreso', async () => {
    const s = await getSummary('custom', 'MXN', '2025-06', NOW);
    expect(s.plan).toEqual({ income: 0, invest: 0, save: 0, spending: 0 });
    expect(s.missingIncome).toEqual([{ year: 2025, month: 6 }]);
    expect(s.remaining).toBeCloseTo(-100);
  });

  it('convierte a la divisa pedida', async () => {
    const s = await getSummary('month', 'AUD', undefined, NOW);
    expect(s.plan.income).toBeCloseTo(2000);
    expect(s.plan.spending).toBeCloseTo(1000);
    expect(s.totalExpenses).toBeCloseTo(94); // 80 + 10 + 4
  });

  it('suma los 12 meses del último año', async () => {
    const s = await getSummary('year', 'MXN', undefined, NOW);
    expect(s.months).toHaveLength(12);
    expect(s.months[0]).toEqual({ year: 2024, month: 9 });
    expect(s.months.at(-1)).toEqual({ year: 2025, month: 8 });
    expect(s.plan.income).toBeCloseTo(45000);
    expect(s.plan.spending).toBeCloseTo(22500);
    expect(s.totalExpenses).toBeCloseTo(1575);
    expect(s.missingIncome).toHaveLength(10);
  });

  it('"todo" va del primer mes con datos al mes actual', async () => {
    const s = await getSummary('all', 'MXN', undefined, NOW);
    expect(s.months).toEqual([
      { year: 2025, month: 6 },
      { year: 2025, month: 7 },
      { year: 2025, month: 8 },
    ]);
    expect(s.totalExpenses).toBeCloseTo(1575); // sin el gasto de septiembre
    expect(s.plan.spending).toBeCloseTo(22500);
  });

  it('no cuenta ingresos de meses futuros en "todo"', async () => {
    db.ingresos.push({ id: 3, period_year: 2025, period_month: 9, amount: '1000.00', currency_code: 'MXN' });
    const s = await getSummary('all', 'MXN', undefined, NOW);
    expect(s.plan.income).toBeCloseTo(45000);
  });

  it('rechaza rangos y meses inválidos', async () => {
    await expect(getSummary('week', 'MXN', undefined, NOW)).rejects.toMatchObject({ status: 400 });
    await expect(getSummary('custom', 'MXN', '2025-13', NOW)).rejects.toMatchObject({ status: 400 });
  });
});

describe('getHistoricalTable', () => {
  it('muestra ingreso, reparto y gasto por mes', async () => {
    const t = await getHistoricalTable('MXN', NOW);
    expect(t.months).toEqual([
      { year: 2025, month: 6 },
      { year: 2025, month: 7 },
      { year: 2025, month: 8 },
    ]);
    expect(t.plan[0]).toMatchObject({ income: 0, missing: true });
    expect(t.plan[1]).toEqual({ income: 20000, invest: 6000, save: 4000, spending: 10000 });
    expect(t.plan[2].spending).toBeCloseTo(12500);
    expect(t.spent[0]).toBeCloseTo(100);
    expect(t.spent[1]).toBeCloseTo(300);
    expect(t.spent[2]).toBeCloseTo(1175);
    const comida = t.categories.find((c) => c.id === 1);
    expect(comida.months).toEqual([100, 300, 1000]);
    expect(comida.total).toBe(1400);
  });

  it('funciona sin datos', async () => {
    resetDb();
    const t = await getHistoricalTable('MXN', NOW);
    expect(t.months).toEqual([{ year: 2025, month: 8 }]);
    expect(t.spent).toEqual([0]);
  });
});
