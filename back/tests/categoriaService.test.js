import { describe, it, expect, vi, beforeEach } from 'vitest';

const created = { categorias: [], presupuestos: [] };

vi.mock('../config/index.js', () => ({
  sequelize: { transaction: vi.fn(async (fn) => fn({})) },
}));
vi.mock('../models/categoria.model.js', () => ({
  Categoria: {
    create: vi.fn(async (data) => {
      const row = { id: created.categorias.length + 1, ...data };
      created.categorias.push(row);
      return { ...row, toJSON: () => row };
    }),
    findAll: vi.fn(async () => [
      { id: 2, name: 'Comida', description: 'x' },
      { id: 1, name: 'Renta', description: null },
    ]),
  },
}));
vi.mock('../models/presupuesto.model.js', () => ({
  Presupuesto: {
    create: vi.fn(async (data) => {
      created.presupuestos.push(data);
      return data;
    }),
  },
}));

const { createCategoryWithBudget, getAllCategories } = await import(
  '../services/categoriaService.js'
);

beforeEach(() => {
  created.categorias = [];
  created.presupuestos = [];
});

describe('createCategoryWithBudget', () => {
  it('crea un presupuesto recurrente con fecha fin al inicio del mes final', async () => {
    const cat = await createCategoryWithBudget({
      name: 'Comida',
      description: '',
      recurring: true,
      amount: 1500.5,
      currency_code: 'AUD',
      start_month: 3,
      start_year: 2025,
      end_month: 12,
      end_year: 2025,
    });
    expect(cat).toMatchObject({ id: 1, name: 'Comida' });
    expect(created.presupuestos).toHaveLength(1);
    const p = created.presupuestos[0];
    expect(p).toMatchObject({
      category_id: 1,
      amount: 1500.5,
      currency_code: 'AUD',
      period_month: 3,
      period_year: 2025,
      recurring: true,
    });
    expect(p.recurrence_end_date.getFullYear()).toBe(2025);
    expect(p.recurrence_end_date.getMonth()).toBe(11);
  });

  it('crea un presupuesto por cada mes no recurrente', async () => {
    await createCategoryWithBudget({
      name: 'Viajes',
      recurring: false,
      currency_code: 'MXN',
      budgets: [
        { month: 1, year: 2025, amount: 100 },
        { month: 2, year: 2025, amount: 200 },
      ],
    });
    expect(created.presupuestos.map((p) => [p.period_month, p.amount])).toEqual([
      [1, 100],
      [2, 200],
    ]);
    expect(created.presupuestos.every((p) => p.recurring === false)).toBe(true);
  });

  it('rechaza presupuestos recurrentes incompletos', async () => {
    await expect(
      createCategoryWithBudget({ name: 'X', recurring: true, currency_code: 'MXN' })
    ).rejects.toThrow('Missing fields for recurring budget');
  });

  it('rechaza presupuestos mensuales vacíos o inválidos', async () => {
    await expect(
      createCategoryWithBudget({ name: 'X', recurring: false, currency_code: 'MXN', budgets: [] })
    ).rejects.toThrow('No budgets provided');
    await expect(
      createCategoryWithBudget({
        name: 'X',
        recurring: false,
        currency_code: 'MXN',
        budgets: [{ month: 1, year: 2025 }],
      })
    ).rejects.toThrow('Invalid budget entry');
  });
});

describe('getAllCategories', () => {
  it('devuelve solo id y nombre', async () => {
    expect(await getAllCategories()).toEqual([
      { id: 2, name: 'Comida' },
      { id: 1, name: 'Renta' },
    ]);
  });
});
