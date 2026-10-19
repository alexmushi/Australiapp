import { describe, it, expect, vi, beforeEach } from 'vitest';

const rows = [];
vi.mock('../models/gasto.model.js', () => ({
  Gasto: {
    create: vi.fn(async (data) => {
      const row = { id: rows.length + 1, ...data };
      rows.push(row);
      return { toJSON: () => row };
    }),
  },
}));

const { createGasto } = await import('../services/gastoService.js');

beforeEach(() => {
  rows.length = 0;
});

describe('createGasto', () => {
  it('guarda un gasto simple sin datos de recurrencia', async () => {
    const g = await createGasto({
      amount: 12.34,
      currency_code: 'AUD',
      category_id: 3,
      date: '2025-07-01',
      description: 'café',
      recurring: false,
      recurrence_type: 'monthly',
      recurrence_end_date: '2025-12-01',
    });
    expect(g).toEqual({
      id: 1,
      amount: 12.34,
      currency_code: 'AUD',
      category_id: 3,
      date: '2025-07-01',
      description: 'café',
      recurring: false,
      recurrence_type: null,
      recurrence_end_date: null,
    });
  });

  it('conserva la recurrencia cuando el gasto es recurrente', async () => {
    const g = await createGasto({
      amount: 50,
      currency_code: 'MXN',
      category_id: 1,
      date: '2025-07-01',
      recurring: true,
      recurrence_type: 'weekly',
      recurrence_end_date: '2025-09-01',
    });
    expect(g).toMatchObject({
      recurring: true,
      recurrence_type: 'weekly',
      recurrence_end_date: '2025-09-01',
    });
  });
});
