import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { mockFetch, fail } from './test/mockFetch.js';
import { REVIEWER, USER, signIn } from './test/render.jsx';

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid='doughnut' />,
  Bar: (props) => (
    <button type='button' data-testid='bar-chart' onClick={() => props.options.onClick({}, [{ index: 0 }])}>
      {props['aria-label']}
    </button>
  ),
}));

const emptyReport = {
  months: [{ year: 2025, month: 8 }],
  plan: { income: 0, invest: 0, save: 0, spending: 0 },
  missingIncome: [{ year: 2025, month: 8 }],
  totalExpenses: 0,
  remaining: 0,
  categories: [],
  expenses: [],
};

function api(extra = {}) {
  return mockFetch({
    'POST /api/auth/login': ({ body }) =>
      body.password !== 'secreta'
        ? fail(401, { error: 'Invalid credentials' })
        : body.username === 'mama'
          ? REVIEWER
          : USER,
    'GET /api/notificaciones': [],
    'GET /api/categorias': [],
    'GET /api/divisas': ['AUD', 'MXN'],
    'GET /api/reports/summary': emptyReport,
    'GET /api/reports/summary-table': { months: [], plan: [], spent: [], categories: [] },
    'GET /api/ingresos': [],
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
    await user.click(within(nav).getByRole('button', { name: 'Ingresos' }));
    expect(window.location.hash).toBe('#/ingresos');
    expect(screen.getByRole('button', { name: 'Guardar ingreso' })).toBeInTheDocument();
    await user.click(within(nav).getByRole('button', { name: 'Categorías' }));
    expect(window.location.hash).toBe('#/categoria');
    expect(screen.getByRole('button', { name: 'Crear categoría' })).toBeInTheDocument();
  });

  it('el aviso de ingreso faltante lleva a Ingresos', async () => {
    api();
    signIn();
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Registrar ingreso' }));
    expect(window.location.hash).toBe('#/ingresos');
    expect(screen.getByRole('heading', { name: 'Ingresos', level: 1 })).toBeInTheDocument();
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

  it('manda el token en cada petición', async () => {
    const { fn } = api();
    signIn();
    render(<App />);
    await screen.findByRole('button', { name: 'Registrar ingreso' });
    const calls = fn.mock.calls.filter(([url]) => url.startsWith('/api/') && !url.includes('/auth/'));
    expect(calls.length).toBeGreaterThan(0);
    for (const [, opts] of calls) expect(opts.headers.Authorization).toBe('Bearer tok-owner');
  });

  it('descarta sesiones guardadas sin token (versión anterior)', () => {
    api();
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, username: 'alex', default_currency_code: 'MXN' }));
    render(<App />);
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('vuelve al login si la sesión expira', async () => {
    api({ 'GET /api/reports/summary': fail(401, { error: 'Sesión inválida o expirada' }) });
    signIn();
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('el revisor solo ve el resumen, en modo lectura', async () => {
    api();
    const user = userEvent.setup();
    window.location.hash = '#/gasto';
    render(<App />);
    await user.type(screen.getByLabelText('Usuario'), 'mama');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('heading', { name: 'Resumen Solo lectura', level: 1 })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    expect(within(nav).getAllByRole('button').map((b) => b.textContent)).toEqual(['Resumen']);
    expect(screen.queryByRole('button', { name: 'Registrar ingreso' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }));
    expect(screen.getByText('Revisor · solo lectura')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revisores' })).not.toBeInTheDocument();
  });

  it('el dueño abre Revisores desde su menú', async () => {
    api({ 'GET /api/reviewers': [{ id: 2, username: 'mama' }] });
    signIn();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Menú de usuario' }));
    await user.click(screen.getByRole('button', { name: 'Revisores' }));
    expect(window.location.hash).toBe('#/revisores');
    expect(await screen.findByText('mama')).toBeInTheDocument();
  });

  it('muestra las notificaciones y las marca como leídas', async () => {
    api({
      'GET /api/notificaciones': [
        { id: 'missing-income-2025-08', severity: 'warning', title: 'Falta tu ingreso del mes', message: 'Registra…', action: 'income' },
      ],
    });
    signIn();
    const user = userEvent.setup();
    render(<App />);
    const bell = await screen.findByRole('button', { name: 'Notificaciones (1 sin leer)' });
    await user.click(bell);
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Falta tu ingreso del mes/ }));
    expect(window.location.hash).toBe('#/ingresos');
    expect(JSON.parse(localStorage.getItem('notifications_read'))).toEqual(['missing-income-2025-08']);
  });
});
