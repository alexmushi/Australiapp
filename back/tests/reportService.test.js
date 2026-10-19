import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Op } from 'sequelize';

const db = { categorias: [], presupuestos: [], gastos: [] };

vi.mock('../models/categoria.model.js', () => ({
  Categoria: { findAll: vi.fn(async () => db.categorias) },
}));

vi.mock('../models/presupuesto.model.js', () => ({
  Presupuesto: {
    findAll: vi.fn(async (opts = {}) =>
      opts.where?.category_id != null
        ? db.presupuestos.filter((p) => p.category_id === opts.where.category_id)
        : db.presupuestos
    ),
  },
}));

vi.mock('../models/gasto.model.js', () => ({
  Gasto: {
    findAll: vi.fn(async (opts = {}) => {
      const cond = opts.where?.date;
      return db.gastos.filter((g) => {
        if (!cond) return true;
        if (cond[Op.between]) {
          const [from, to] = cond[Op.between];
          return g.date >= from && g.date <= to;
        }
        if (cond[Op.lte]) return g.date <= cond[Op.lte];
        return true;
      });
    }),
  },
}));

// Unidades de cada divisa por 1 MXN (así las guarda el cron de divisas).
vi.mock('../services/divisaService.js', () => ({
  getDivisaRates: vi.fn(async () => ({ MXN: 1, AUD: 0.08, USD: 0.05 })),
}));

const { getSummary, getCategoryDetail, getHistoricalTable } = await import(
  '../services/reportService.js'
);

const d = (iso) => new Date(`${iso}T00:00:00.000Z`);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-15T12:00:00.000Z'));
  db.categorias = [
    { id: 1, name: 'Comida' },
    { id: 2, name: 'Transporte' },
  ];
  db.presupuestos = [
    {
      category_id: 1,
      amount: '1000.00',
      currency_code: 'MXN',
      period_month: 6,
      period_year: 2025,
      recurring: true,
      recurrence_end_date: d('2025-12-01'),
    },
    {
      category_id: 2,
      amount: '40.00',
      currency_code: 'AUD',
      period_month: 8,
      period_year: 2025,
      recurring: false,
      recurrence_end_date: null,
    },
  ];
  db.gastos = [
    { id: 1, amount: '100.00', currency_code: 'MXN', category_id: 1, date: d('2025-07-31'), description: 'julio' },
    { id: 2, amount: '100.00', currency_code: 'MXN', category_id: 1, date: d('2025-08-01'), description: 'super' },
    { id: 3, amount: '10.00', currency_code: 'AUD', category_id: 1, date: d('2025-08-10'), description: null },
    { id: 4, amount: '20.00', currency_code: 'AUD', category_id: 2, date: d('2025-08-12'), description: 'bus' },
  ];
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getSummary', () => {
  it('suma presupuestos y gastos del mes actual en MXN', async () => {
    const s = await getSummary('month', 'MXN');
    const comida = s.categories.find((c) => c.id === 1);
    const transporte = s.categories.find((c) => c.id === 2);
    expect(comida.budget).toBeCloseTo(1000);
    expect(comida.expenses).toBeCloseTo(225); // 100 MXN + 10 AUD (125 MXN)
    expect(transporte.budget).toBeCloseTo(500); // 40 AUD
    expect(transporte.expenses).toBeCloseTo(250); // 20 AUD
    expect(s.totalBudget).toBeCloseTo(1500);
    expect(s.totalExpenses).toBeCloseTo(475);
    expect(s.expenses.map((e) => e.id)).toEqual([2, 3, 4]);
  });

  it('convierte todo a la divisa solicitada', async () => {
    const s = await getSummary('month', 'AUD');
    const comida = s.categories.find((c) => c.id === 1);
    expect(comida.budget).toBeCloseTo(80);
    expect(comida.expenses).toBeCloseTo(18); // 8 AUD + 10 AUD
    const transporte = s.categories.find((c) => c.id === 2);
    expect(transporte.budget).toBeCloseTo(40);
    expect(transporte.expenses).toBeCloseTo(20);
    expect(s.expenses.find((e) => e.id === 3).amount).toBeCloseTo(10);
  });

  it('respeta el mes elegido en el rango custom', async () => {
    const s = await getSummary('custom', 'MXN', '2025-07');
    const comida = s.categories.find((c) => c.id === 1);
    const transporte = s.categories.find((c) => c.id === 2);
    expect(comida.budget).toBeCloseTo(1000);
    expect(comida.expenses).toBeCloseTo(100);
    expect(transporte.budget).toBeCloseTo(0); // presupuesto solo en agosto
    expect(s.expenses.map((e) => e.id)).toEqual([1]);
  });

  it('cuenta los meses de presupuesto recurrente en el último año', async () => {
    const s = await getSummary('year', 'MXN');
    const comida = s.categories.find((c) => c.id === 1);
    expect(comida.budget).toBeCloseTo(3000); // junio, julio y agosto
    expect(comida.expenses).toBeCloseTo(325);
  });

  it('no cuenta presupuesto recurrente después de su fecha fin', async () => {
    vi.setSystemTime(new Date('2026-02-10T12:00:00.000Z'));
    const s = await getSummary('month', 'MXN');
    expect(s.categories.find((c) => c.id === 1).budget).toBe(0);
  });
});

describe('getCategoryDetail', () => {
  it('devuelve solo los gastos de la categoría con su total', async () => {
    const r = await getCategoryDetail('1', 'month', 'MXN');
    expect(r.name).toBe('Comida');
    expect(r.budget).toBeCloseTo(1000);
    expect(r.expenses.items.map((e) => e.id)).toEqual([2, 3]);
    expect(r.expenses.total).toBeCloseTo(225);
  });

  it('falla si la categoría no existe', async () => {
    await expect(getCategoryDetail('99', 'month', 'MXN')).rejects.toThrow(
      'Categoria no encontrada'
    );
  });
});

describe('getHistoricalTable', () => {
  it('reparte presupuesto y gastos por mes', async () => {
    db.gastos.push({
      id: 5,
      amount: '50.00',
      currency_code: 'MXN',
      category_id: 1,
      date: d('2025-05-20'),
      description: 'antes',
    });
    const t = await getHistoricalTable('MXN');
    expect(t.months).toHaveLength(13);
    expect(t.months[0]).toEqual({ year: 2025, month: 6 });
    const comida = t.categories.find((c) => c.id === 1);
    expect(comida.antesReal).toBeCloseTo(50);
    expect(comida.antesBudget).toBe(0);
    expect(comida.months[0].budget).toBeCloseTo(1000); // junio
    expect(comida.months[1].real).toBeCloseTo(100); // julio
    expect(comida.months[2].real).toBeCloseTo(225); // agosto
    expect(comida.months[6].budget).toBeCloseTo(1000); // diciembre
    expect(comida.months[7].budget).toBe(0); // enero, fuera de recurrencia
    expect(comida.totalBudget).toBeCloseTo(7000);
    expect(comida.totalReal).toBeCloseTo(375);
    const transporte = t.categories.find((c) => c.id === 2);
    expect(transporte.months[2].budget).toBeCloseTo(500);
    expect(transporte.totalBudget).toBeCloseTo(500);
  });
});
