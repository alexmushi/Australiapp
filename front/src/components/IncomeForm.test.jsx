import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IncomeForm from './IncomeForm.jsx';
import { mockFetch, fail } from '../test/mockFetch.js';
import { renderWithProviders } from '../test/render.jsx';

let incomes;

function setup(put) {
  const api = mockFetch({
    'GET /api/divisas': ['AUD', 'MXN'],
    'GET /api/ingresos': () => incomes,
    'PUT *':
      put ??
      (({ url, body }) => {
        const [, , , y, m] = url.split('/');
        const row = { id: 9, period_year: Number(y), period_month: Number(m), ...body };
        incomes = [row, ...incomes.filter((i) => !(i.period_year === row.period_year && i.period_month === row.period_month))];
        return row;
      }),
    'DELETE *': ({ url }) => {
      const [, , , y, m] = url.split('/');
      incomes = incomes.filter((i) => !(i.period_year === Number(y) && i.period_month === Number(m)));
      return { deleted: true };
    },
  });
  const user = userEvent.setup();
  renderWithProviders(<IncomeForm />);
  return { api, user, writes: () => api.calls.filter((c) => c.method !== 'GET') };
}

beforeEach(() => {
  incomes = [];
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2025-10-18T23:00:00Z')); // 19 oct 2025 en Sídney
});
afterEach(() => vi.useRealTimers());

describe('IncomeForm', () => {
  it('pregunta por lo ganado el mes anterior y muestra el reparto', async () => {
    const { user } = setup();
    expect(screen.getByRole('heading', { name: '¿Cuánto ganaste en septiembre 2025?' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Divisa')).toHaveValue('AUD'));
    await user.type(screen.getByLabelText('Ingreso'), '1234,57');
    expect(screen.getByTestId('split-invest')).toHaveTextContent('370.37');
    expect(screen.getByTestId('split-save')).toHaveTextContent('246.91');
    expect(screen.getByTestId('split-spending')).toHaveTextContent('617.29');
  });

  it('guarda el ingreso en el mes del presupuesto', async () => {
    const { user, writes } = setup();
    await waitFor(() => expect(screen.getByLabelText('Divisa')).toHaveValue('AUD'));
    await user.type(screen.getByLabelText('Ingreso'), '4000');
    await user.selectOptions(screen.getByLabelText('Divisa'), 'MXN');
    await user.type(screen.getByLabelText('Nota (opcional)'), ' sueldo ');
    await user.click(screen.getByRole('button', { name: 'Guardar ingreso' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0]).toEqual({
      method: 'PUT',
      url: '/api/ingresos/2025/10',
      body: { amount: 4000, currency_code: 'MXN', description: 'sueldo' },
    });
    expect(await screen.findByText('Ingreso registrado')).toBeInTheDocument();
    // aparece en la lista y el formulario pasa a modo edición
    const list = screen.getByRole('heading', { name: 'Ingresos registrados' }).closest('section');
    expect(await within(list).findByText('octubre 2025')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar ingreso' })).toBeInTheDocument();
    expect(screen.getByLabelText('Ingreso')).toHaveValue('4000');
  });

  it('permite elegir otro mes', async () => {
    const { user, writes } = setup();
    await waitFor(() => expect(screen.getByLabelText('Divisa')).toHaveValue('AUD'));
    await user.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(screen.getByRole('heading', { name: '¿Cuánto ganaste en agosto 2025?' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Ingreso'), '10');
    await user.click(screen.getByRole('button', { name: 'Guardar ingreso' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0].url).toBe('/api/ingresos/2025/9');
  });

  it('carga el ingreso existente del mes para editarlo', async () => {
    incomes = [
      { id: 1, period_year: 2025, period_month: 10, amount: 3000, currency_code: 'MXN', description: 'x' },
      { id: 2, period_year: 2025, period_month: 9, amount: 1500.5, currency_code: 'AUD', description: null },
    ];
    const { user } = setup();
    await waitFor(() => expect(screen.getByLabelText('Ingreso')).toHaveValue('3000'));
    expect(screen.getByLabelText('Divisa')).toHaveValue('MXN');
    expect(screen.getByText('Ya registrado · editando')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Editar ingreso de septiembre 2025' }));
    expect(screen.getByLabelText('Ingreso')).toHaveValue('1500.5');
    expect(screen.getByLabelText('Divisa')).toHaveValue('AUD');
  });

  it('pide confirmación antes de eliminar', async () => {
    incomes = [{ id: 1, period_year: 2025, period_month: 10, amount: 3000, currency_code: 'MXN', description: null }];
    const { user, writes } = setup();
    await user.click(await screen.findByRole('button', { name: 'Eliminar ingreso de octubre 2025' }));
    expect(writes()).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(writes()).toEqual([{ method: 'DELETE', url: '/api/ingresos/2025/10', body: undefined }]));
    expect(await screen.findByText('Sin ingresos')).toBeInTheDocument();
    expect(screen.getByLabelText('Ingreso')).toHaveValue('');
  });

  it('valida el monto', async () => {
    const { user, writes } = setup();
    await waitFor(() => expect(screen.getByLabelText('Divisa')).toHaveValue('AUD'));
    await user.click(screen.getByRole('button', { name: 'Guardar ingreso' }));
    expect(screen.getByText('Ingresa lo que ganaste.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Ingreso'), '0');
    await user.click(screen.getByRole('button', { name: 'Guardar ingreso' }));
    expect(screen.getByText('Ingresa un monto mayor a 0.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('muestra el error del servidor', async () => {
    const { user } = setup(() => fail(400, { error: 'Divisa inválida' }));
    await waitFor(() => expect(screen.getByLabelText('Divisa')).toHaveValue('AUD'));
    await user.type(screen.getByLabelText('Ingreso'), '10');
    await user.click(screen.getByRole('button', { name: 'Guardar ingreso' }));
    expect(await screen.findByText('Divisa inválida')).toBeInTheDocument();
    expect(screen.getByLabelText('Ingreso')).toHaveValue('10');
  });
});
