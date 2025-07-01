const API_URL = '/api/auth';
const REVIEWER_URL = '/api/reviewers';
const CATEGORY_URL = '/api/categorias';
const USER_URL = '/api/users';
const DIVISA_URL = '/api/divisas';
const EXPENSE_URL = '/api/gastos';
const REPORT_URL = '/api/reports';

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed registration');
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

export async function addReviewer(data) {
  const res = await fetch(REVIEWER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add reviewer');
  return res.json();
}

export async function createCategory(data) {
  const res = await fetch(CATEGORY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(CATEGORY_URL);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function updateUserCurrency(userId, code) {
  const res = await fetch(`${USER_URL}/${userId}/currency`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('Failed to update currency');
  return res.json();
}

export async function fetchCurrencies() {
  const res = await fetch(DIVISA_URL);
  if (!res.ok) throw new Error('Failed to fetch currencies');
  return res.json();
}

export async function createExpense(data) {
  const res = await fetch(EXPENSE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function fetchReport(range = 'month', category = 'all') {
  const url =
    category === 'all'
      ? `${REPORT_URL}/summary?range=${range}`
      : `${REPORT_URL}/category/${category}?range=${range}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}