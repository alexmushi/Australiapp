import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryForm from './CategoryForm.jsx';
import { mockFetch, fail } from '../test/mockFetch.js';
import { renderWithProviders } from '../test/render.jsx';

function setup(post = (req) => ({ id: 1, ...req.body })) {
  const api = mockFetch({ 'POST /api/categorias': post });
  const user = userEvent.setup();
  renderWithProviders(<CategoryForm />);
  return { user, posts: () => api.calls.filter((c) => c.method === 'POST') };
}

describe('CategoryForm', () => {
  it('crea una categoría solo con nombre y descripción', async () => {
    const { user, posts } = setup();
    expect(screen.queryByText(/Presupuesto/)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Nombre'), ' Comida ');
    await user.type(screen.getByLabelText('Descripción (opcional)'), 'Súper y mercado');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    await waitFor(() => expect(posts()).toHaveLength(1));
    expect(posts()[0].body).toEqual({ name: 'Comida', description: 'Súper y mercado' });
    expect(await screen.findByText('Categoría creada')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('');
  });

  it('exige el nombre', async () => {
    const { user, posts } = setup();
    await user.type(screen.getByLabelText('Nombre'), '   ');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(screen.getByText('Ingresa un nombre.')).toBeInTheDocument();
    expect(posts()).toHaveLength(0);
  });

  it('muestra el error del servidor y conserva lo escrito', async () => {
    const { user } = setup(() => fail(400, { error: 'Ya existe una categoría con ese nombre' }));
    await user.type(screen.getByLabelText('Nombre'), 'Comida');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(await screen.findByText('Ya existe una categoría con ese nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Comida');
  });
});
