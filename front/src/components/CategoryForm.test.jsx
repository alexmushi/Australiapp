import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryForm from './CategoryForm.jsx';
import { mockFetch, fail } from '../test/mockFetch.js';
import { renderWithProviders } from '../test/render.jsx';

const YEAR = String(new Date().getFullYear());

function setup(post = (req) => ({ id: 1, ...req.body })) {
  const api = mockFetch({ 'GET /api/divisas': ['AUD', 'MXN'], 'POST /api/categorias': post });
  const user = userEvent.setup();
  renderWithProviders(<CategoryForm />);
  return { user, posts: () => api.calls.filter((c) => c.method === 'POST') };
}

const ready = () =>
  waitFor(() => expect(screen.getByLabelText('Divisa del presupuesto')).toHaveValue('AUD'));

describe('CategoryForm', () => {
  it('crea un presupuesto recurrente', async () => {
    const { user, posts } = setup();
    await ready();
    await user.type(screen.getByLabelText('Nombre'), ' Comida ');
    await user.type(screen.getByLabelText('Monto mensual'), '1500,5');
    await user.selectOptions(screen.getByLabelText('Mes inicio'), '3');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    await waitFor(() => expect(posts()).toHaveLength(1));
    expect(posts()[0].body).toEqual({
      name: 'Comida',
      description: '',
      recurring: true,
      amount: 1500.5,
      currency_code: 'AUD',
      start_month: 3,
      start_year: Number(YEAR),
      end_month: 12,
      end_year: Number(YEAR),
    });
    expect(await screen.findByText('Categoría creada')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('');
  });

  it('crea presupuestos por mes', async () => {
    const { user, posts } = setup();
    await ready();
    await user.type(screen.getByLabelText('Nombre'), 'Viajes');
    await user.click(screen.getByRole('radio', { name: 'Monto por mes' }));
    await user.type(screen.getByLabelText('Monto'), '100');
    await user.click(screen.getByRole('button', { name: /Agregar mes/ }));
    await user.click(screen.getByRole('button', { name: /Agregar mes/ }));
    const amounts = screen.getAllByLabelText('Monto');
    await user.type(amounts[1], '200');
    await user.type(amounts[2], '300');
    await user.click(screen.getByRole('button', { name: 'Quitar mes 2' }));
    expect(screen.getByText(/Total:/)).toHaveTextContent('400.00');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    await waitFor(() => expect(posts()).toHaveLength(1));
    expect(posts()[0].body).toEqual({
      name: 'Viajes',
      description: '',
      recurring: false,
      currency_code: 'AUD',
      budgets: [
        { month: 1, year: Number(YEAR), amount: 100 },
        { month: 3, year: Number(YEAR), amount: 300 },
      ],
    });
  });

  it('valida antes de enviar', async () => {
    const { user, posts } = setup();
    await ready();
    await user.selectOptions(screen.getByLabelText('Mes inicio'), '6');
    await user.selectOptions(screen.getByLabelText('Mes fin'), '5');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(screen.getByText('Ingresa un nombre.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa el monto mensual.')).toBeInTheDocument();
    expect(screen.getByText(/fin debe ser igual o posterior/)).toBeInTheDocument();
    expect(posts()).toHaveLength(0);
  });

  it('muestra el error del servidor', async () => {
    const { user } = setup(() => fail(400, { error: 'Missing fields for recurring budget' }));
    await ready();
    await user.type(screen.getByLabelText('Nombre'), 'X');
    await user.type(screen.getByLabelText('Monto mensual'), '1');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(await screen.findByText('Missing fields for recurring budget')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('X');
  });
});
