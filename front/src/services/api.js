const API_URL = '/api/auth';
const REVIEWER_URL = '/api/reviewers';
const CATEGORY_URL = '/api/categorias';
const USER_URL = '/api/users';
const DIVISA_URL = '/api/divisas';
const EXPENSE_URL = '/api/gastos';
const REPORT_URL = '/api/reports';

export class ApiError extends Error {
  constructor(message, status, serverMessage) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

async function request(url, fallbackMessage, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      ...(body !== undefined && {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    });
  } catch {
    throw new ApiError('No hay conexión con el servidor', 0);
  }
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

export function addReviewer(data) {
  return request(REVIEWER_URL, 'Failed to add reviewer', { method: 'POST', body: data });
}

export function createCategory(data) {
  return request(CATEGORY_URL, 'Failed to create category', { method: 'POST', body: data });
}

export function fetchCategories() {
  return request(CATEGORY_URL, 'Failed to fetch categories');
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

export function fetchReport(range = 'month', category = 'all', currency = 'MXN', month) {
  const params = new URLSearchParams({ range });
  if (range === 'custom' && month) params.set('month', month);
  params.set('currency', currency);
  const url =
    category === 'all'
      ? `${REPORT_URL}/summary?${params}`
      : `${REPORT_URL}/category/${encodeURIComponent(category)}?${params}`;
  return request(url, 'Failed to fetch report');
}

export function fetchSummaryTable(currency = 'MXN') {
  const params = new URLSearchParams({ currency });
  return request(`${REPORT_URL}/summary-table?${params}`, 'Failed to fetch report table');
}
