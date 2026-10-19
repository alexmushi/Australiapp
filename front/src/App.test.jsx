import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { mockFetch, fail } from './test/mockFetch.js';
import { USER, signIn } from './test/render.jsx';

vi.mock('react-chartjs-2', () => ({ Doughnut: () => <div data-testid='doughnut' /> }));

const emptyReport = { categories: [], totalBudget: 0, totalExpenses: 0, expenses: [] };

function api(extra = {}) {
  return mockFetch({
    'POST /api/auth/login': ({ body }) =>
      body.password === 'secreta' ? USER : fail(400, { error: 'Invalid credentials' }),
    'GET /api/categorias': [],
    'GET /api/divisas': ['AUD', 'MXN'],
    'GET /api/reports/summary': emptyReport,
    'GET /api/reports/summary-table': { months: [], categories: [] },
    'PUT /api/users/1/currency': ({ body }) => ({ ...USER, default_currency_code: body.code }),
    ...extra,
  });
}

describe('App', () => {
  it('pide completar los campos', async () => {
    const { calls } = api();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(screen.getByText('Por favor, completa todos los campos.')).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });

  it('muestra error con credenciales incorrectas', async () => {
    api();
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Usuario'), 'alex');
    await user.type(screen.getByLabelText('Contraseña'), 'mala');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByText('Usuario o contraseña incorrectos.')).toBeInTheDocument();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('inicia sesión, recuerda al usuario y cierra sesión', async () => {
    api();
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Usuario'), 'alex');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta');
    await user.click(screen.getByRole('checkbox', { name: /Recuérdame/ }));
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('heading', { name: 'Resumen', level: 1 })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('auth_user'))).toEqual(USER);

    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }));
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('no guarda la sesión sin "Recuérdame"', async () => {
    api();
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Usuario'), 'alex');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByRole('heading', { name: 'Resumen', level: 1 });
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('restaura la sesión guardada sin mostrar el login', () => {
    api();
    signIn();
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Resumen', level: 1 })).toBeInTheDocument();
  });

  it('navega entre vistas y actualiza el hash', async () => {
    api();
    signIn();
    const user = userEvent.setup();
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    await user.click(within(nav).getByRole('button', { name: 'Registrar gasto' }));
    expect(screen.getByRole('heading', { name: 'Registrar gasto', level: 1 })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/gasto');
    await user.click(within(nav).getByRole('button', { name: 'Nueva categoría' }));
    expect(window.location.hash).toBe('#/categoria');
    expect(screen.getByRole('button', { name: 'Crear categoría' })).toBeInTheDocument();
  });

  it('abre la vista indicada en el hash', () => {
    api();
    signIn();
    window.location.hash = '#/gasto';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Registrar gasto', level: 1 })).toBeInTheDocument();
  });

  it('cambia la divisa y vuelve a pedir el reporte en esa divisa', async () => {
    const { calls } = api();
    signIn();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }));
    const select = await screen.findByLabelText('Divisa de visualización');
    await waitFor(() => expect(within(select).getAllByRole('option')).toHaveLength(2));
    await user.selectOptions(select, 'AUD');
    await waitFor(() =>
      expect(calls.some((c) => c.url === '/api/reports/summary?range=month&currency=AUD')).toBe(true)
    );
    expect(calls.find((c) => c.method === 'PUT').body).toEqual({ code: 'AUD' });
    // la sesión recordada se actualiza
    expect(JSON.parse(localStorage.getItem('auth_user')).default_currency_code).toBe('AUD');
  });
});

import { within } from '@testing-library/react';
