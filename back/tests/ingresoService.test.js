import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db, resetDb } from './mockDb.js';

vi.mock('../models/ingreso.model.js', async () => ({ Ingreso: (await import('./mockDb.js')).model('ingresos') }));
vi.mock('../services/divisaService.js', () => ({
  getDivisaRates: vi.fn(async () => ({ MXN: 1, AUD: 0.08 })),
}));

const { deleteIngreso, listIngresos, upsertIngreso } = await import('../services/ingresoService.js');

beforeEach(() => resetDb());

describe('ingresos', () => {
  it('crea y luego reemplaza el ingreso del mismo mes', async () => {
    const a = await upsertIngreso('2025', '8', { amount: 1500.555, currency_code: 'AUD' });
    expect(a).toMatchObject({ period_year: 2025, period_month: 8, amount: 1500.56, currency_code: 'AUD', description: null });
    await upsertIngreso(2025, 8, { amount: '2000', currency_code: 'MXN', description: ' sueldo ' });
    expect(db.ingresos).toHaveLength(1);
    expect(db.ingresos[0]).toMatchObject({ amount: 2000, currency_code: 'MXN', description: 'sueldo' });
  });

  it('lista del más reciente al más antiguo', async () => {
    await upsertIngreso(2025, 7, { amount: 1, currency_code: 'MXN' });
    await upsertIngreso(2025, 8, { amount: 2, currency_code: 'MXN' });
    const list = await listIngresos();
    expect(list.map((i) => i.amount)).toEqual(expect.arrayContaining([1, 2]));
  });

  it.each([
    [2025, 8, { amount: 0, currency_code: 'MXN' }],
    [2025, 8, { amount: -5, currency_code: 'MXN' }],
    [2025, 8, { amount: 'abc', currency_code: 'MXN' }],
    [2025, 8, { amount: 10, currency_code: 'GBP' }],
    [2025, 8, { amount: 10 }],
    [2025, 13, { amount: 10, currency_code: 'MXN' }],
    ['x', 8, { amount: 10, currency_code: 'MXN' }],
  ])('rechaza %s/%s %o', async (y, m, data) => {
    await expect(upsertIngreso(y, m, data)).rejects.toMatchObject({ status: 400 });
    expect(db.ingresos).toHaveLength(0);
  });

  it('elimina y avisa si no existe', async () => {
    await upsertIngreso(2025, 8, { amount: 10, currency_code: 'MXN' });
    await expect(deleteIngreso(2025, 8)).resolves.toEqual({ deleted: true });
    await expect(deleteIngreso(2025, 8)).rejects.toMatchObject({ status: 404 });
  });
});
