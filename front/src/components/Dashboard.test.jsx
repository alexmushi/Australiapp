import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard.jsx';
import { mockFetch, fail } from '../test/mockFetch.js';
import { renderWithProviders, signIn } from '../test/render.jsx';

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid='doughnut' />,
  Bar: (props) => (
    <button type='button' data-testid='bar-chart' onClick={() => props.options.onClick({}, [{ index: 0 }])}>
      {props['aria-label']}
    </button>
  ),
}));

const CATEGORIES = [
  { id: 1, name: 'Renta' },
  { id: 2, name: 'Comida' },
];
const SUMMARY = {
  months: [{ year: 2025, month: 8 }],
  plan: { income: 4000, invest: 1200, save: 800, spending: 2000 },
  missingIncome: [],
  totalExpenses: 1650.5,
  remaining: 349.5,
  categories: [
    { id: 1, name: 'Renta', expenses: 1000 },
    { id: 2, name: 'Comida', expenses: 650.5 },
  ],
  expenses: [
    { id: 1, category_id: 1, amount: 1000, date: '2025-08-01T00:00:00.000Z', description: 'Renta agosto' },
    { id: 2, category_id: 2, amount: 400.25, date: '2025-08-03T00:00:00.000Z', description: null },
    { id: 3, category_id: 2, amount: 250.25, date: '2025-08-02T00:00:00.000Z', description: 'Súper' },
  ],
};
const TABLE = {
  months: [{ year: 2025, month: 7 }, { year: 2025, month: 8 }],
  plan: [
    { income: 0, invest: 0, save: 0, spending: 0, missing: true },
    { income: 4000, invest: 1200, save: 800, spending: 2000 },
  ],
  spent: [100, 1650.5],
  categories: [
    { id: 1, name: 'Renta', months: [100, 1000], total: 1100 },
    { id: 2, name: 'Comida', months: [0, 650.5], total: 650.5 },
  ],
};

function setup(routes = {}) {
  signIn();
  const api = mockFetch({
    'GET /api/categorias': CATEGORIES,
    'GET /api/reports/summary': SUMMARY,
    'GET /api/reports/summary-table': TABLE,
    ...routes,
  });
  const user = userEvent.setup();
  const onAddIncome = vi.fn();
  renderWithProviders(<Dashboard onAddIncome={onAddIncome} />);
  return { api, user, onAddIncome };
}

const cells = (row) => within(row).getAllByRole('cell').map((c) => c.textContent);

describe('Dashboard', () => {
  it('muestra el reparto 30/20/50 y lo que queda para gastar', async () => {
    setup();
    expect(await screen.findByTestId('remaining')).toHaveTextContent('$349.50');
    expect(screen.getByText(/restante de \$2,000.00/)).toBeInTheDocument();
    expect(screen.getByTestId('total-spent')).toHaveTextContent('$1,650.50');
    expect(screen.getByText('83% usado')).toBeInTheDocument();
    expect(screen.getByText('Dentro del 50%')).toBeInTheDocument();
    expect(screen.getByTestId('plan-income')).toHaveTextContent('$4,000.00');
    expect(screen.getByTestId('plan-invest')).toHaveTextContent('$1,200.00');
    expect(screen.getByTestId('plan-save')).toHaveTextContent('$800.00');
    expect(screen.getByTestId('plan-spending')).toHaveTextContent('$2,000.00');
    expect(screen.getByText('Invertir 30%')).toBeInTheDocument();
    expect(screen.getByText('Renta agosto')).toBeInTheDocument();
    expect(screen.getByText('Sin descripción')).toBeInTheDocument();
  });

  it('marca cuando te pasas del 50%', async () => {
    setup({
      'GET /api/reports/summary': { ...SUMMARY, plan: { income: 3000, invest: 900, save: 600, spending: 1500 } },
    });
    expect(await screen.findByTestId('remaining')).toHaveTextContent('-$150.50');
    expect(screen.getByText('Te pasaste del 50%')).toBeInTheDocument();
  });

  it('invita a registrar el ingreso si falta', async () => {
    const { user, onAddIncome } = setup({
      'GET /api/reports/summary': {
        ...SUMMARY,
        plan: { income: 0, invest: 0, save: 0, spending: 0 },
        missingIncome: [{ year: 2025, month: 8 }],
      },
    });
    expect(await screen.findByText('Aún no registras tu ingreso')).toBeInTheDocument();
    expect(screen.getByText(/lo que ganaste en julio 2025/)).toBeInTheDocument();
    expect(screen.getByTestId('total-spent')).toHaveTextContent('$1,650.50');
    await user.click(screen.getByRole('button', { name: 'Registrar ingreso' }));
    expect(onAddIncome).toHaveBeenCalled();
  });

  it('avisa de meses sin ingreso en periodos largos', async () => {
    setup({
      'GET /api/reports/summary': {
        ...SUMMARY,
        months: [{ year: 2025, month: 6 }, { year: 2025, month: 7 }, { year: 2025, month: 8 }],
        missingIncome: [{ year: 2025, month: 6 }, { year: 2025, month: 7 }],
      },
    });
    expect(await screen.findByText(/Sin ingreso registrado en 2 meses: junio 2025, julio 2025/)).toBeInTheDocument();
  });

  it('el filtro de categorías no cambia lo disponible', async () => {
    const { api, user } = setup();
    await screen.findByTestId('remaining');
    const before = api.calls.length;
    await user.click(screen.getByRole('button', { name: /Categorías:/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Comida' }));
    expect(screen.getByTestId('remaining')).toHaveTextContent('$349.50');
    expect(screen.getByText('Categorías filtradas · $650.50')).toBeInTheDocument();
    expect(screen.queryByText('Renta agosto')).not.toBeInTheDocument();
    expect(screen.getByText('Súper')).toBeInTheDocument();
    expect(api.calls.length).toBe(before); // se filtra sin pedir otro reporte
    expect(JSON.parse(localStorage.getItem('dashboard_selected_categories'))).toEqual(['2']);
  });

  it('muestra la tabla histórica', async () => {
    setup();
    const table = await screen.findByRole('table');
    const row = (name) => within(table).getByRole('rowheader', { name }).closest('tr');
    expect(cells(row('Ingreso'))).toEqual(['—', '4,000.00', '4,000.00']);
    expect(cells(row('Para gastos (50%)'))).toEqual(['—', '2,000.00', '2,000.00']);
    expect(cells(row('Renta'))).toEqual(['100.00', '1,000.00', '1,100.00']);
    expect(cells(row('Total gastado'))).toEqual(['100.00', '1,650.50', '1,750.50']);
    expect(cells(row('Diferencia'))).toEqual(['-100.00', '349.50', '249.50']);
    expect(cells(row('Acumulado'))).toEqual(['-100.00', '249.50', '']);
  });

  it('pide el mes elegido', async () => {
    const { api, user } = setup();
    await screen.findByTestId('remaining');
    await user.click(screen.getByRole('radio', { name: 'Elegir mes' }));
    await user.click(screen.getByRole('button', { name: 'Mes anterior' }));
    const months = api.calls
      .map((c) => c.url)
      .filter((u) => u.includes('range=custom'))
      .map((u) => new URLSearchParams(u.split('?')[1]).get('month'));
    expect(months.length).toBeGreaterThanOrEqual(2);
    const [y, m] = months[0].split('-').map(Number);
    expect(months.at(-1)).toBe(m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`);
  });

  it('descarta categorías guardadas que ya no existen', async () => {
    localStorage.setItem('dashboard_selected_categories', JSON.stringify(['99']));
    setup();
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('dashboard_selected_categories'))).toEqual(['all'])
    );
    expect(await screen.findByText('Renta agosto')).toBeInTheDocument();
  });

  it('muestra un error con opción de reintentar', async () => {
    let attempts = 0;
    const { user } = setup({
      'GET /api/reports/summary': () => (++attempts === 1 ? fail(500, { error: 'boom' }) : SUMMARY),
    });
    expect(await screen.findByText('No se pudo cargar el resumen')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(await screen.findByTestId('remaining')).toHaveTextContent('$349.50');
  });

  it('muestra la marca del día y cuánto gastar por día en el mes actual', async () => {
    setup();
    await screen.findByTestId('remaining');
    expect(screen.getByTestId('month-marker')).toBeInTheDocument();
    expect(screen.getByTestId('month-progress')).toHaveTextContent(/Día \d+ de \d+/);
    expect(screen.getByTestId('month-progress')).toHaveTextContent(/por día/);
  });

  it('no muestra la marca del día en otros periodos', async () => {
    const { user } = setup();
    await screen.findByTestId('remaining');
    await user.click(screen.getByRole('radio', { name: 'Todo' }));
    await screen.findByTestId('remaining');
    expect(screen.queryByTestId('month-marker')).not.toBeInTheDocument();
  });

  it('la gráfica mensual sigue el filtro y abre el mes al hacer clic', async () => {
    const { api, user } = setup();
    const chart = await screen.findByTestId('bar-chart');
    expect(chart).toHaveTextContent('Gasto por mes: JUL 25 $100.00, AGO 25 $1,650.50');
    await user.click(screen.getByRole('button', { name: /Categorías:/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Comida' }));
    expect(screen.getByTestId('bar-chart')).toHaveTextContent('Gasto por mes · Comida: JUL 25 $0.00, AGO 25 $650.50');
    await user.click(screen.getByTestId('bar-chart'));
    await waitFor(() => expect(api.calls.some((c) => c.url.includes('range=custom&month=2025-07'))).toBe(true));
    expect(screen.getByRole('radio', { name: 'Elegir mes' })).toBeChecked();
  });
});
