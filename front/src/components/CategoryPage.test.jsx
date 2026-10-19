import { describe, it, expect } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryPage from './CategoryPage.jsx';
import { mockFetch, fail } from '../test/mockFetch.js';
import { renderWithProviders, signIn } from '../test/render.jsx';

let categories;

function setup(routes = {}) {
  signIn();
  categories = [
    { id: 1, name: 'Renta', description: 'Depa', expense_count: 3 },
    { id: 2, name: 'Viajes', description: null, expense_count: 0 },
  ];
  const api = mockFetch({
    'GET /api/categorias': () => categories,
    'GET /api/reports/summary': {
      months: [],
      plan: { income: 0, invest: 0, save: 0, spending: 0 },
      missingIncome: [],
      categories: [
        { id: 1, name: 'Renta', expenses: 9000 },
        { id: 2, name: 'Viajes', expenses: 0 },
      ],
      expenses: [],
    },
    'PUT /api/categorias/1': ({ body }) => {
      categories = categories.map((c) => (c.id === 1 ? { ...c, ...body } : c));
      return { id: 1, ...body };
    },
    'DELETE /api/categorias/2': () => {
      categories = categories.filter((c) => c.id !== 2);
      return { deleted: true };
    },
    'POST /api/categorias': ({ body }) => {
      categories = [...categories, { id: 3, ...body, expense_count: 0 }];
      return { id: 3, ...body };
    },
    ...routes,
  });
  const user = userEvent.setup();
  renderWithProviders(<CategoryPage />);
  return { api, user };
}

const table = () => screen.getByRole('table');
const rowOf = (name) => within(table()).getByText(name).closest('tr');

describe('CategoryPage', () => {
  it('lista categorías con lo gastado este mes y número de gastos', async () => {
    setup();
    await waitFor(() => expect(within(rowOf('Renta')).getByText('$9,000.00')).toBeInTheDocument());
    expect(within(rowOf('Renta')).getByText('Depa')).toBeInTheDocument();
    expect(within(rowOf('Viajes')).getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText(/2 categorías · \$9,000.00 gastado este mes/)).toBeInTheDocument();
  });

  it('edita nombre y descripción', async () => {
    const { api, user } = setup();
    await screen.findByText('Depa');
    await user.click(screen.getByRole('button', { name: 'Editar Renta' }));
    const name = screen.getByLabelText('Nombre de la categoría');
    await user.clear(name);
    await user.type(name, 'Renta depa');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() =>
      expect(api.calls.find((c) => c.method === 'PUT').body).toEqual({ name: 'Renta depa', description: 'Depa' })
    );
    expect(await within(table()).findByText('Renta depa')).toBeInTheDocument();
  });

  it('no permite borrar categorías con gastos', async () => {
    setup();
    await screen.findByText('Depa');
    expect(screen.getByRole('button', { name: 'No se puede eliminar Renta: tiene gastos' })).toBeDisabled();
  });

  it('borra una categoría sin gastos tras confirmar', async () => {
    const { api, user } = setup();
    await screen.findByText('Depa');
    await user.click(screen.getByRole('button', { name: 'Eliminar Viajes' }));
    expect(api.calls.some((c) => c.method === 'DELETE')).toBe(false);
    await user.click(within(rowOf('Viajes')).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(within(table()).queryByText('Viajes')).not.toBeInTheDocument());
    expect(await screen.findByText('Categoría eliminada')).toBeInTheDocument();
  });

  it('muestra el error del servidor al editar', async () => {
    const { user } = setup({ 'PUT /api/categorias/1': fail(400, { error: 'Ya existe una categoría con ese nombre' }) });
    await screen.findByText('Depa');
    await user.click(screen.getByRole('button', { name: 'Editar Renta' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Ya existe una categoría con ese nombre')).toBeInTheDocument();
  });

  it('al crear una categoría aparece en la tabla', async () => {
    const { user } = setup();
    await screen.findByText('Depa');
    await user.type(screen.getByLabelText('Nombre'), 'Salud');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(await within(table()).findByText('Salud')).toBeInTheDocument();
  });
});
