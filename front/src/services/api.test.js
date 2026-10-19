import { describe, it, expect } from 'vitest';
import { mockFetch, fail } from '../test/mockFetch.js';
import {
  createCategory,
  createExpense,
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
    await fetchReport('month', 'all', 'MXN');
    await fetchReport('custom', 'all', 'AUD', '2025-07');
    await fetchReport('month', '3', 'MXN', '2025-07');
    await fetchReport('custom', '3', 'MXN', '2025-07');
    await fetchSummaryTable('USD');
    expect(calls.map((c) => c.url)).toEqual([
      '/api/reports/summary?range=month&currency=MXN',
      '/api/reports/summary?range=custom&month=2025-07&currency=AUD',
      '/api/reports/category/3?range=month&currency=MXN',
      '/api/reports/category/3?range=custom&month=2025-07&currency=MXN',
      '/api/reports/summary-table?currency=USD',
    ]);
  });

  it('envía JSON en POST y PUT', async () => {
    const { calls } = mockFetch({ 'POST *': { id: 1 }, 'PUT *': { id: 1 } });
    await createExpense({ amount: 5 });
    await createCategory({ name: 'x' });
    await loginUser({ username: 'a', password: 'b' });
    await updateUserCurrency(7, 'AUD');
    expect(calls).toEqual([
      { method: 'POST', url: '/api/gastos', body: { amount: 5 } },
      { method: 'POST', url: '/api/categorias', body: { name: 'x' } },
      { method: 'POST', url: '/api/auth/login', body: { username: 'a', password: 'b' } },
      { method: 'PUT', url: '/api/users/7/currency', body: { code: 'AUD' } },
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
