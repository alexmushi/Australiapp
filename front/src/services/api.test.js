import { describe, it, expect } from 'vitest';
import { mockFetch, fail } from '../test/mockFetch.js';
import {
  createCategory,
  createExpense,
  deleteIncome,
  fetchIncomes,
  saveIncome,
  fetchCategories,
  fetchCurrencies,
  fetchReport,
  fetchSummaryTable,
  loginUser,
  updateUserCurrency,
} from './api.js';

describe('api', () => {
  it('usa las mismas URLs de reportes que espera el backend', async () => {
    const { calls } = mockFetch({ 'GET *': {} });
    await fetchReport('month', 'MXN');
    await fetchReport('month', 'MXN', '2025-07');
    await fetchReport('custom', 'AUD', '2025-07');
    await fetchSummaryTable('USD');
    await fetchIncomes();
    expect(calls.map((c) => c.url)).toEqual([
      '/api/reports/summary?range=month&currency=MXN',
      '/api/reports/summary?range=month&currency=MXN',
      '/api/reports/summary?range=custom&month=2025-07&currency=AUD',
      '/api/reports/summary-table?currency=USD',
      '/api/ingresos',
    ]);
  });

  it('envía JSON en POST y PUT', async () => {
    const { calls } = mockFetch({ 'POST *': { id: 1 }, 'PUT *': { id: 1 }, 'DELETE *': { deleted: true } });
    await createExpense({ amount: 5 });
    await createCategory({ name: 'x' });
    await loginUser({ username: 'a', password: 'b' });
    await updateUserCurrency(7, 'AUD');
    await saveIncome(2025, 8, { amount: 100, currency_code: 'AUD' });
    await deleteIncome('2025', '08');
    expect(calls).toEqual([
      { method: 'POST', url: '/api/gastos', body: { amount: 5 } },
      { method: 'POST', url: '/api/categorias', body: { name: 'x' } },
      { method: 'POST', url: '/api/auth/login', body: { username: 'a', password: 'b' } },
      { method: 'PUT', url: '/api/users/7/currency', body: { code: 'AUD' } },
      { method: 'PUT', url: '/api/ingresos/2025/8', body: { amount: 100, currency_code: 'AUD' } },
      { method: 'DELETE', url: '/api/ingresos/2025/8', body: undefined },
    ]);
  });

  it('lee listas', async () => {
    mockFetch({ 'GET /api/categorias': [{ id: 1 }], 'GET /api/divisas': ['MXN'] });
    expect(await fetchCategories()).toEqual([{ id: 1 }]);
    expect(await fetchCurrencies()).toEqual(['MXN']);
  });

  it('expone el mensaje del servidor al fallar', async () => {
    mockFetch({ 'POST /api/gastos': fail(400, { error: 'Bad amount' }) });
    await expect(createExpense({})).rejects.toMatchObject({
      status: 400,
      serverMessage: 'Bad amount',
    });
  });

  it('distingue errores de red', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };
    await expect(fetchCategories()).rejects.toMatchObject({ status: 0 });
  });
});
