import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewersPanel from './ReviewersPanel.jsx';
import { mockFetch, fail } from '../test/mockFetch.js';
import { renderWithProviders, signIn } from '../test/render.jsx';

let reviewers;

function setup(routes = {}) {
  signIn();
  reviewers = [{ id: 2, username: 'mama' }];
  const api = mockFetch({
    'GET /api/reviewers': () => reviewers,
    'POST /api/reviewers': ({ body }) => {
      const r = { id: 3, username: body.username };
      reviewers = [...reviewers, r];
      return r;
    },
    'DELETE /api/reviewers/2': () => {
      reviewers = reviewers.filter((r) => r.id !== 2);
      return { deleted: true };
    },
    ...routes,
  });
  const user = userEvent.setup();
  renderWithProviders(<ReviewersPanel />);
  return { api, user };
}

describe('ReviewersPanel', () => {
  it('crea un revisor con usuario y contraseña', async () => {
    const { api, user } = setup();
    await screen.findByText('mama');
    await user.type(screen.getByLabelText('Usuario'), 'papa');
    await user.type(screen.getByLabelText('Contraseña'), 'contraseña1');
    await user.click(screen.getByRole('button', { name: 'Crear revisor' }));
    await waitFor(() =>
      expect(api.calls.find((c) => c.method === 'POST').body).toEqual({ username: 'papa', password: 'contraseña1' })
    );
    expect(await screen.findByText('papa')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toHaveValue('');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('');
  });

  it('valida antes de enviar', async () => {
    const { api, user } = setup();
    await user.type(screen.getByLabelText('Usuario'), 'a b');
    await user.type(screen.getByLabelText('Contraseña'), 'corta');
    await user.click(screen.getByRole('button', { name: 'Crear revisor' }));
    expect(screen.getByText(/De 3 a 50 letras/)).toBeInTheDocument();
    expect(screen.getByText('Al menos 8 caracteres.')).toBeInTheDocument();
    expect(api.calls.some((c) => c.method === 'POST')).toBe(false);
  });

  it('muestra el error del servidor', async () => {
    const { user } = setup({ 'POST /api/reviewers': fail(400, { error: 'Ese nombre de usuario ya existe' }) });
    await user.type(screen.getByLabelText('Usuario'), 'mama');
    await user.type(screen.getByLabelText('Contraseña'), 'contraseña1');
    await user.click(screen.getByRole('button', { name: 'Crear revisor' }));
    expect(await screen.findByText('Ese nombre de usuario ya existe')).toBeInTheDocument();
  });

  it('quita el acceso tras confirmar', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Quitar a mama' }));
    await user.click(screen.getByRole('button', { name: 'Quitar acceso' }));
    expect(await screen.findByText('Sin revisores')).toBeInTheDocument();
  });
});
