import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard.jsx';
import { mockFetch, fail } from '../test/mockFetch.js';
import { renderWithProviders, signIn } from '../test/render.jsx';

vi.mock('react-chartjs-2', () => ({ Doughnut: () => <div data-testid='doughnut' /> }));

const CATEGORIES = [
  { id: 1, name: 'Renta' },
  { id: 2, name: 'Comida' },
];
const SUMMARY = {
  categories: [
    { id: 1, name: 'Renta', budget: 1000, expenses: 1000 },
    { id: 2, name: 'Comida', budget: 500, expenses: 650.5 },
  ],
  totalBudget: 1500,
  totalExpenses: 1650.5,
  expenses: [
    { id: 1, category_id: 1, amount: 1000, date: '2025-07-01T00:00:00.000Z', description: 'Renta julio' },
    { id: 2, category_id: 2, amount: 400.25, date: '2025-07-03T00:00:00.000Z', description: null },
    { id: 3, category_id: 2, amount: 250.25, date: '2025-07-02T00:00:00.000Z', description: 'Súper' },
  ],
};
const TABLE = {
  months: [{ year: 2025, month: 6 }],
  categories: [
    { id: 1, name: 'Renta', antesBudget: 0, antesReal: 10, months: [{ budget: 1000, real: 1200 }], totalBudget: 1000, totalReal: 1210 },
  ],
};

function setup(routes = {}) {
  signIn();
  const api = mockFetch({
    'GET /api/categorias': CATEGORIES,
    'GET /api/reports/summary': SUMMARY,
    'GET /api/reports/summary-table': TABLE,
    'GET /api/reports/category/2': {
      id: 2,
      name: 'Comida',
      budget: 500,
      expenses: { total: 650.5, items: SUMMARY.expenses.slice(1) },
    },
    ...routes,
  });
  const user = userEvent.setup();
  renderWithProviders(<Dashboard />);
  return { api, user };
}

describe('Dashboard', () => {
  it('muestra totales, estado y movimientos', async () => {
    setup();
    expect(await screen.findByTestId('total-spent')).toHaveTextContent('$1,650.50');
    expect(screen.getByText('gastado de $1,500.00')).toBeInTheDocument();
    expect(screen.getByText('Presupuesto excedido')).toBeInTheDocument();
    expect(screen.getByText('110% usado')).toBeInTheDocument();
    expect(screen.getAllByText('$150.50 sobre')).toHaveLength(2); // total y Comida
    expect(screen.getByText('Renta julio')).toBeInTheDocument();
    expect(screen.getByText('Sin descripción')).toBeInTheDocument();
    expect(screen.getByText('03/07/2025')).toBeInTheDocument();
    expect(await screen.findByText('Histórico mensual')).toBeInTheDocument();
  });

  it('muestra la tabla histórica con totales', async () => {
    setup();
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');
    const mensual = rows.find((r) => r.textContent.startsWith('Mensual'));
    expect(within(mensual).getAllByRole('cell').map((c) => c.textContent)).toEqual([
      'Mensual', '0.00', '10.00', '-10.00', '1,000.00', '1,200.00', '-200.00', '1,000.00', '1,210.00',
    ]);
    const acumulado = rows.find((r) => r.textContent.startsWith('Acumulado'));
    expect(within(acumulado).getAllByRole('cell').map((c) => c.textContent)).toEqual([
      'Acumulado', '', '', '-10.00', '', '', '-210.00', '', '',
    ]);
  });

  it('pide el reporte de una categoría al seleccionarla', async () => {
    const { api, user } = setup();
    await screen.findByTestId('total-spent');
    const breakdown = screen.getByRole('heading', { name: 'Por categoría' }).closest('section');
    await user.click(within(breakdown).getByRole('button', { name: /Comida/ }));
    await waitFor(() =>
      expect(api.calls.some((c) => c.url === '/api/reports/category/2?range=month&currency=MXN')).toBe(true)
    );
    expect(await screen.findByText('gastado de $500.00')).toBeInTheDocument();
    expect(screen.queryByText('Histórico mensual')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('dashboard_selected_categories'))).toEqual(['2']);
  });

  it('filtra varias categorías sin pedir otro reporte', async () => {
    const { api, user } = setup({ 'GET /api/categorias': [...CATEGORIES, { id: 3, name: 'Bus' }] });
    await screen.findByTestId('total-spent');
    await user.click(screen.getByRole('button', { name: /Categorías:/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Renta' }));
    await user.click(screen.getByRole('checkbox', { name: 'Comida' }));
    await waitFor(() => expect(screen.getByTestId('total-spent')).toHaveTextContent('$1,650.50'));
    expect(screen.getByRole('button', { name: /Categorías:/ })).toHaveTextContent('2 categorías');
    const reports = api.calls.filter((c) => c.url.startsWith('/api/reports/') && !c.url.includes('summary-table'));
    expect(reports.at(-1).url).toBe('/api/reports/summary?range=month&currency=MXN');
  });

  it('pide el mes elegido', async () => {
    const { api, user } = setup();
    await screen.findByTestId('total-spent');
    await user.click(screen.getByRole('radio', { name: 'Elegir mes' }));
    await user.click(screen.getByRole('button', { name: 'Mes anterior' }));
    const urls = api.calls.map((c) => c.url).filter((u) => u.includes('range=custom'));
    expect(urls.length).toBeGreaterThanOrEqual(2);
    const months = urls.map((u) => new URLSearchParams(u.split('?')[1]).get('month'));
    const [y, m] = months[0].split('-').map(Number);
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
    expect(months.at(-1)).toBe(prev);
  });

  it('descarta categorías guardadas que ya no existen', async () => {
    localStorage.setItem('dashboard_selected_categories', JSON.stringify(['99']));
    const { api } = setup();
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('dashboard_selected_categories'))).toEqual(['all'])
    );
    expect(await screen.findByTestId('total-spent')).toHaveTextContent('$1,650.50');
    expect(api.calls.filter((c) => c.url.includes('/category/'))).toHaveLength(0);
    expect(screen.queryByText('No se pudo cargar el resumen')).not.toBeInTheDocument();
  });

  it('muestra un error con opción de reintentar', async () => {
    let attempts = 0;
    const { user } = setup({
      'GET /api/reports/summary': () => (++attempts === 1 ? fail(500, { error: 'boom' }) : SUMMARY),
    });
    expect(await screen.findByText('No se pudo cargar el resumen')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(await screen.findByTestId('total-spent')).toHaveTextContent('$1,650.50');
  });
});
