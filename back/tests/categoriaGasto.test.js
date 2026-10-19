import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db, resetDb } from './mockDb.js';

vi.mock('../models/categoria.model.js', async () => ({ Categoria: (await import('./mockDb.js')).model('categorias') }));
vi.mock('../models/gasto.model.js', async () => ({ Gasto: (await import('./mockDb.js')).model('gastos') }));
vi.mock('../services/divisaService.js', () => ({
  getDivisaRates: vi.fn(async () => ({ MXN: 1, AUD: 0.08 })),
}));

const { createCategory, deleteCategory, getAllCategories, updateCategory } = await import(
  '../services/categoriaService.js'
);
const { createGasto } = await import('../services/gastoService.js');

beforeEach(() => {
  resetDb();
  db.categorias = [{ id: 1, name: 'Comida', description: null }];
});

describe('createCategory', () => {
  it('crea una categoría solo con nombre', async () => {
    const c = await createCategory({ name: '  Renta ', description: '' });
    expect(c).toMatchObject({ id: 2, name: 'Renta', description: null });
  });
  it('rechaza nombres vacíos, largos o repetidos', async () => {
    await expect(createCategory({ name: '  ' })).rejects.toMatchObject({ status: 400 });
    await expect(createCategory({ name: 'x'.repeat(51) })).rejects.toMatchObject({ status: 400 });
    await expect(createCategory({ name: 'comida' })).rejects.toThrow('Ya existe');
  });
  it('lista con descripción y número de gastos', async () => {
    db.gastos = [{ id: 1, category_id: 1 }, { id: 2, category_id: 1 }];
    expect(await getAllCategories()).toEqual([{ id: 1, name: 'Comida', description: null, expense_count: 2 }]);
  });
});

describe('updateCategory / deleteCategory', () => {
  it('renombra y cambia la descripción', async () => {
    expect(await updateCategory('1', { name: ' Súper ', description: 'mercado' })).toEqual({
      id: 1,
      name: 'Súper',
      description: 'mercado',
    });
    expect(db.categorias[0]).toMatchObject({ name: 'Súper', description: 'mercado' });
  });
  it('permite conservar el mismo nombre pero no duplicar otro', async () => {
    db.categorias.push({ id: 2, name: 'Renta' });
    await expect(updateCategory(1, { name: 'comida' })).resolves.toMatchObject({ name: 'comida' });
    await expect(updateCategory(1, { name: 'RENTA' })).rejects.toThrow('Ya existe');
    await expect(updateCategory(9, { name: 'x' })).rejects.toMatchObject({ status: 404 });
    await expect(updateCategory(1, { name: '' })).rejects.toMatchObject({ status: 400 });
  });
  it('borra solo categorías sin gastos', async () => {
    db.gastos = [{ id: 1, category_id: 1 }];
    await expect(deleteCategory(1)).rejects.toMatchObject({ status: 409 });
    expect(db.categorias).toHaveLength(1);
    db.gastos = [];
    await expect(deleteCategory(1)).resolves.toEqual({ deleted: true });
    expect(db.categorias).toHaveLength(0);
    await expect(deleteCategory(1)).rejects.toMatchObject({ status: 404 });
  });
});

const valid = {
  amount: 12.34,
  currency_code: 'AUD',
  category_id: 1,
  date: '2025-07-01',
  description: 'café',
  recurring: false,
  recurrence_type: null,
  recurrence_end_date: null,
};

describe('createGasto', () => {
  it('guarda un gasto válido', async () => {
    const g = await createGasto(valid);
    expect(g).toEqual({ id: 1, ...valid });
  });

  it('guarda la recurrencia solo si es recurrente', async () => {
    await createGasto({ ...valid, recurrence_type: 'monthly', recurrence_end_date: '2025-12-01' });
    expect(db.gastos[0]).toMatchObject({ recurrence_type: null, recurrence_end_date: null });
    await createGasto({ ...valid, recurring: true, recurrence_type: 'weekly', recurrence_end_date: '2025-09-01' });
    expect(db.gastos[1]).toMatchObject({ recurring: true, recurrence_type: 'weekly', recurrence_end_date: '2025-09-01' });
  });

  it('redondea el monto a centavos', async () => {
    await createGasto({ ...valid, amount: 5.005 });
    expect(db.gastos[0].amount).toBe(5.01);
  });

  it.each([
    [{ amount: 0 }],
    [{ amount: NaN }],
    [{ amount: null }],
    [{ currency_code: 'GBP' }],
    [{ category_id: 99 }],
    [{ category_id: 'x' }],
    [{ date: '2025-02-30' }],
    [{ date: '01/07/2025' }],
    [{ recurring: 'yes' }],
    [{ recurring: true, recurrence_type: 'daily' }],
    [{ recurring: true, recurrence_type: 'monthly', recurrence_end_date: '2025-06-01' }],
    [{ description: 'x'.repeat(256) }],
  ])('rechaza %o', async (patch) => {
    await expect(createGasto({ ...valid, ...patch })).rejects.toMatchObject({ status: 400 });
    expect(db.gastos).toHaveLength(0);
  });
});
