import { describe, it, expect } from 'vitest';
import { mockFetch, fail } from '../test/mockFetch.js';
import {
  createCategory,
  addReviewer,
  createExpense,
  deleteCategory,
  fetchMonthStatus,
  fetchNotifications,
  fetchReviewers,
  removeReviewer,
  setAuthToken,
  setUnauthorizedHandler,
  updateCategory,
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
    await fetchMonthStatus('2025-08', 'AUD');
    await fetchNotifications('MXN');
    await fetchReviewers();
    expect(calls.map((c) => c.url)).toEqual([
      '/api/reports/summary?range=month&currency=MXN',
      '/api/reports/summary?range=month&currency=MXN',
      '/api/reports/summary?range=custom&month=2025-07&currency=AUD',
      '/api/reports/summary-table?currency=USD',
      '/api/ingresos',
      '/api/reports/month-status?currency=AUD&month=2025-08',
      '/api/notificaciones?currency=MXN',
      '/api/reviewers',
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
    await updateCategory(4, { name: 'x' });
    await deleteCategory('4');
    await addReviewer({ username: 'u', password: 'p' });
    await removeReviewer(2);
    expect(calls).toEqual([
      { method: 'POST', url: '/api/gastos', body: { amount: 5 } },
      { method: 'POST', url: '/api/categorias', body: { name: 'x' } },
      { method: 'POST', url: '/api/auth/login', body: { username: 'a', password: 'b' } },
      { method: 'PUT', url: '/api/users/7/currency', body: { code: 'AUD' } },
      { method: 'PUT', url: '/api/ingresos/2025/8', body: { amount: 100, currency_code: 'AUD' } },
      { method: 'DELETE', url: '/api/ingresos/2025/8', body: undefined },
      { method: 'PUT', url: '/api/categorias/4', body: { name: 'x' } },
      { method: 'DELETE', url: '/api/categorias/4', body: undefined },
      { method: 'POST', url: '/api/reviewers', body: { username: 'u', password: 'p' } },
      { method: 'DELETE', url: '/api/reviewers/2', body: undefined },
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

  it('manda el token y avisa cuando el servidor responde 401', async () => {
    const { fn } = mockFetch({ 'GET /api/categorias': fail(401, { error: 'expirada' }) });
    let called = 0;
    setAuthToken('abc');
    setUnauthorizedHandler(() => called++);
    await expect(fetchCategories()).rejects.toMatchObject({ status: 401 });
    expect(fn.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer abc' });
    expect(called).toBe(1);
    setAuthToken(null);
    await expect(fetchCategories()).rejects.toMatchObject({ status: 401 });
    expect(called).toBe(1); // sin sesión no hay nada que cerrar
    setUnauthorizedHandler(null);
  });
});
