import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseForm from './ExpenseForm.jsx';
import { mockFetch, fail } from '../test/mockFetch.js';
import { renderWithProviders } from '../test/render.jsx';

const CATEGORIES = [
  { id: 4, name: 'Comida' },
  { id: 9, name: 'Renta' },
];

function setup(postHandler = (req) => ({ id: 1, ...req.body })) {
  const api = mockFetch({
    'GET /api/divisas': ['AUD', 'MXN'],
    'GET /api/categorias': CATEGORIES,
    'POST /api/gastos': postHandler,
  });
  const user = userEvent.setup();
  renderWithProviders(<ExpenseForm />);
  return { api, user, posts: () => api.calls.filter((c) => c.method === 'POST') };
}

async function ready() {
  await waitFor(() => expect(screen.getByLabelText('Divisa')).toHaveValue('AUD'));
  await waitFor(() => expect(screen.getByLabelText('Categoría')).toHaveValue('4'));
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  // 19 oct 2025 10:00 en Sídney
  vi.setSystemTime(new Date('2025-10-18T23:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('ExpenseForm', () => {
  it('usa la fecha de hoy en Sídney por defecto', async () => {
    setup();
    await ready();
    expect(screen.getByLabelText('Fecha')).toHaveValue('2025-10-19');
  });

  it('envía el gasto con el mismo formato que antes', async () => {
    const { user, posts } = setup();
    await ready();
    await user.type(screen.getByLabelText('Monto'), '12,50');
    await user.selectOptions(screen.getByLabelText('Categoría'), '9');
    await user.type(screen.getByLabelText('Descripción (opcional)'), '  Café  ');
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));
    await waitFor(() => expect(posts()).toHaveLength(1));
    expect(posts()[0].body).toEqual({
      amount: 12.5,
      currency_code: 'AUD',
      category_id: 9,
      date: '2025-10-19',
      description: 'Café',
      recurring: false,
      recurrence_type: null,
      recurrence_end_date: null,
    });
    expect(await screen.findByText('Gasto registrado')).toBeInTheDocument();
    // limpia monto y descripción, conserva categoría
    expect(screen.getByLabelText('Monto')).toHaveValue('');
    expect(screen.getByLabelText('Descripción (opcional)')).toHaveValue('');
    expect(screen.getByLabelText('Categoría')).toHaveValue('9');
  });

  it('registra la mitad redondeada de un gasto compartido', async () => {
    const { user, posts } = setup();
    await ready();
    await user.type(screen.getByLabelText('Monto'), '10.01');
    await user.click(screen.getByRole('switch', { name: /Gasto compartido/ }));
    expect(screen.getByText(/Se registrará tu mitad/)).toHaveTextContent('5.01');
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));
    await waitFor(() => expect(posts()).toHaveLength(1));
    expect(posts()[0].body.amount).toBe(5.01);
    expect(posts()[0].body.description).toBeNull();
  });

  it('envía los datos de recurrencia', async () => {
    const { user, posts } = setup();
    await ready();
    await user.type(screen.getByLabelText('Monto'), '100');
    await user.click(screen.getByRole('switch', { name: /Gasto recurrente/ }));
    await user.click(screen.getByRole('radio', { name: 'Semanal' }));
    await user.type(screen.getByLabelText('Fecha fin (opcional)'), '2025-12-31');
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));
    await waitFor(() => expect(posts()).toHaveLength(1));
    expect(posts()[0].body).toMatchObject({
      amount: 100,
      recurring: true,
      recurrence_type: 'weekly',
      recurrence_end_date: '2025-12-31',
    });
  });

  it('no envía si el monto es inválido', async () => {
    const { user, posts } = setup();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));
    expect(screen.getByText('Ingresa el monto.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Monto'), '0');
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));
    expect(screen.getByText('Ingresa un monto mayor a 0.')).toBeInTheDocument();
    expect(posts()).toHaveLength(0);
  });

  it('ignora caracteres no válidos en el monto', async () => {
    const { user } = setup();
    await ready();
    await user.type(screen.getByLabelText('Monto'), '1a2.345');
    expect(screen.getByLabelText('Monto')).toHaveValue('12.34');
  });

  it('rechaza una fecha fin anterior al gasto', async () => {
    const { user, posts } = setup();
    await ready();
    await user.type(screen.getByLabelText('Monto'), '5');
    await user.click(screen.getByRole('switch', { name: /Gasto recurrente/ }));
    await user.type(screen.getByLabelText('Fecha fin (opcional)'), '2025-01-01');
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));
    expect(screen.getByText(/posterior a la fecha del gasto/)).toBeInTheDocument();
    expect(posts()).toHaveLength(0);
  });

  it('no duplica el gasto con doble clic', async () => {
    let resolve;
    const { user, posts } = setup(() => new Promise((r) => (resolve = r)));
    await ready();
    await user.type(screen.getByLabelText('Monto'), '20');
    const button = screen.getByRole('button', { name: 'Guardar gasto' });
    await user.dblClick(button);
    await user.click(button);
    expect(posts()).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Guardando/ })).toBeDisabled();
    await act(async () => resolve({ id: 1 }));
    expect(await screen.findByRole('button', { name: 'Guardar gasto' })).toBeEnabled();
  });

  it('muestra el error y conserva los datos si falla', async () => {
    const { user } = setup(() => fail(400, { error: 'Divisa inválida' }));
    await ready();
    await user.type(screen.getByLabelText('Monto'), '20');
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));
    expect(await screen.findByText('No se pudo registrar el gasto')).toBeInTheDocument();
    expect(screen.getByText('Divisa inválida')).toBeInTheDocument();
    expect(screen.getByLabelText('Monto')).toHaveValue('20');
  });
});
