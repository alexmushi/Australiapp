const API_URL = '/api/auth';
const REVIEWER_URL = '/api/reviewers';
const CATEGORY_URL = '/api/categorias';
const USER_URL = '/api/users';
const DIVISA_URL = '/api/divisas';
const EXPENSE_URL = '/api/gastos';
const REPORT_URL = '/api/reports';
const INCOME_URL = '/api/ingresos';

export class ApiError extends Error {
  constructor(message, status, serverMessage) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

// Sesión actual: el token se manda en cada petición; un 401 cierra la sesión.
let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token || null;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(url, fallbackMessage, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  let res;
  try {
    res = await fetch(url, {
      method,
      ...(Object.keys(headers).length && { headers }),
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError('No hay conexión con el servidor', 0);
  }
  if (res.status === 401 && authToken && onUnauthorized) onUnauthorized();
  if (!res.ok) {
    let serverMessage;
    try {
      serverMessage = (await res.json())?.error;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new ApiError(fallbackMessage, res.status, serverMessage);
  }
  return res.json();
}

// export async function registerUser(data) {
//   return request(`${API_URL}/register`, 'Failed registration', { method: 'POST', body: data });
// }

export function loginUser(data) {
  return request(`${API_URL}/login`, 'Invalid credentials', { method: 'POST', body: data });
}

export function fetchReviewers() {
  return request(REVIEWER_URL, 'Failed to fetch reviewers');
}

/** Crea una cuenta de revisor (solo lectura). */
export function addReviewer(data) {
  return request(REVIEWER_URL, 'Failed to add reviewer', { method: 'POST', body: data });
}

export function removeReviewer(id) {
  return request(`${REVIEWER_URL}/${Number(id)}`, 'Failed to remove reviewer', { method: 'DELETE' });
}

export function createCategory(data) {
  return request(CATEGORY_URL, 'Failed to create category', { method: 'POST', body: data });
}

export function fetchCategories() {
  return request(CATEGORY_URL, 'Failed to fetch categories');
}

export function updateCategory(id, data) {
  return request(`${CATEGORY_URL}/${Number(id)}`, 'Failed to update category', { method: 'PUT', body: data });
}

export function deleteCategory(id) {
  return request(`${CATEGORY_URL}/${Number(id)}`, 'Failed to delete category', { method: 'DELETE' });
}

export function updateUserCurrency(userId, code) {
  return request(`${USER_URL}/${encodeURIComponent(userId)}/currency`, 'Failed to update currency', {
    method: 'PUT',
    body: { code },
  });
}

export function fetchCurrencies() {
  return request(DIVISA_URL, 'Failed to fetch currencies');
}

export function fetchCurrencyData() {
  return request(`${DIVISA_URL}/all`, 'Failed to fetch currency data');
}

export function createExpense(data) {
  return request(EXPENSE_URL, 'Failed to create expense', { method: 'POST', body: data });
}

export function fetchReport(range = 'month', currency = 'MXN', month) {
  const params = new URLSearchParams({ range });
  if (range === 'custom' && month) params.set('month', month);
  params.set('currency', currency);
  return request(`${REPORT_URL}/summary?${params}`, 'Failed to fetch report');
}

export function fetchSummaryTable(currency = 'MXN') {
  const params = new URLSearchParams({ currency });
  return request(`${REPORT_URL}/summary-table?${params}`, 'Failed to fetch report table');
}

/** Estado del mes (y los dos anteriores): dinero para gastos, gastado, excedido. */
export function fetchMonthStatus(month, currency = 'MXN') {
  const params = new URLSearchParams({ currency });
  if (month) params.set('month', month);
  return request(`${REPORT_URL}/month-status?${params}`, 'Failed to fetch month status');
}

export function fetchNotifications(currency = 'MXN') {
  const params = new URLSearchParams({ currency });
  return request(`/api/notificaciones?${params}`, 'Failed to fetch notifications');
}

export function fetchIncomes() {
  return request(INCOME_URL, 'Failed to fetch incomes');
}

/** Crea o reemplaza el ingreso que financia el mes indicado. */
export function saveIncome(year, month, data) {
  return request(`${INCOME_URL}/${Number(year)}/${Number(month)}`, 'Failed to save income', {
    method: 'PUT',
    body: data,
  });
}

export function deleteIncome(year, month) {
  return request(`${INCOME_URL}/${Number(year)}/${Number(month)}`, 'Failed to delete income', {
    method: 'DELETE',
  });
}
