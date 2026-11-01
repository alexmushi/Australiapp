import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { db, resetDb } from './mockDb.js';

process.env.AUTH_SECRET = 'test-secret';

vi.mock('../config/index.js', () => ({ sequelize: { transaction: vi.fn(async (fn) => fn({})) } }));
for (const [file, name, table] of [
  ['usuario', 'Usuario', 'usuarios'],
  ['usuarioRevisor', 'UsuarioRevisor', 'revisores'],
  ['categoria', 'Categoria', 'categorias'],
  ['gasto', 'Gasto', 'gastos'],
  ['ingreso', 'Ingreso', 'ingresos'],
  ['divisa', 'Divisa', 'divisas'],
  ['divisaHistorial', 'DivisaHistorial', 'historial'],
]) {
  vi.doMock(`../models/${file}.model.js`, async () => ({ [name]: (await import('./mockDb.js')).model(table) }));
}
vi.mock('../services/divisaService.js', async () => {
  const { makeRateBook } = await import('../utils/rates.js');
  return {
    getDivisaRates: vi.fn(async () => ({ MXN: 1, AUD: 0.08 })),
    getAllDivisaCodes: vi.fn(async () => ['AUD', 'MXN']),
    getAllDivisas: vi.fn(async () => []),
    getRateBook: vi.fn(async () => makeRateBook({ MXN: 1, AUD: 0.08 })),
  };
});

const { signToken, verifyToken } = await import('../utils/auth.js');
const { app } = await import('../app.js');

let server;
let base;
beforeAll(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
afterAll(() => server.close());

const HASH = bcrypt.hashSync('secreta123', 4);
beforeEach(() => {
  resetDb();
  db.usuarios = [
    { id: 1, username: 'alex', password_hash: HASH, default_currency_code: 'MXN' },
    { id: 2, username: 'mama', password_hash: HASH, default_currency_code: 'MXN' },
  ];
  db.revisores = [{ id: 1, user_id: 1, reviewer_id: 2 }];
  db.categorias = [{ id: 1, name: 'Comida' }];
});

async function call(method, path, { token, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

const login = async (username, password = 'secreta123') =>
  (await call('POST', '/auth/login', { body: { username, password } })).data;

describe('tokens', () => {
  it('firma y verifica', () => {
    expect(verifyToken(signToken(7))).toBe(7);
  });
  it('rechaza tokens alterados, mal formados o expirados', () => {
    const t = signToken(7);
    const [payload, sig] = t.split('.');
    const forged = Buffer.from(JSON.stringify({ uid: 1, exp: Date.now() + 1e9 })).toString('base64url');
    expect(verifyToken(`${forged}.${sig}`)).toBeNull();
    expect(verifyToken(`${payload}.${sig}x`)).toBeNull();
    expect(verifyToken(`${payload}`)).toBeNull();
    expect(verifyToken(`${t}.extra`)).toBeNull();
    expect(verifyToken(undefined)).toBeNull();
    expect(verifyToken(signToken(7, Date.now() - 31 * 24 * 3600 * 1000))).toBeNull();
  });
  it('un token firmado con otro secreto no sirve', () => {
    const t = signToken(1);
    process.env.AUTH_SECRET = 'otro';
    expect(verifyToken(t)).toBeNull();
    process.env.AUTH_SECRET = 'test-secret';
  });
});

describe('login', () => {
  it('devuelve usuario, rol y token, sin el hash', async () => {
    const u = await login('alex');
    expect(u).toMatchObject({ id: 1, username: 'alex', role: 'owner' });
    expect(u.password_hash).toBeUndefined();
    expect(verifyToken(u.token)).toBe(1);
    expect((await login('mama')).role).toBe('reviewer');
  });
  it('rechaza credenciales incorrectas o incompletas', async () => {
    expect((await call('POST', '/auth/login', { body: { username: 'alex', password: 'mala' } })).status).toBe(401);
    expect((await call('POST', '/auth/login', { body: { username: 'nadie', password: 'x' } })).status).toBe(401);
    expect((await call('POST', '/auth/login', { body: {} })).status).toBe(401);
  });
});

describe('protección de la API', () => {
  it.each([
    ['GET', '/categorias'],
    ['POST', '/gastos'],
    ['GET', '/reports/summary'],
    ['GET', '/ingresos'],
    ['PUT', '/ingresos/2025/8'],
    ['GET', '/notificaciones'],
    ['GET', '/reviewers'],
    ['GET', '/divisas'],
  ])('%s %s exige sesión', async (method, path) => {
    expect((await call(method, path)).status).toBe(401);
    expect((await call(method, path, { token: 'basura' })).status).toBe(401);
  });

  it('rechaza el token de un usuario eliminado', async () => {
    const { token } = await login('alex');
    db.usuarios = db.usuarios.filter((u) => u.id !== 1);
    expect((await call('GET', '/categorias', { token })).status).toBe(401);
  });

  it('el dueño puede leer y escribir', async () => {
    const { token } = await login('alex');
    expect((await call('GET', '/categorias', { token })).status).toBe(200);
    const r = await call('POST', '/categorias', { token, body: { name: 'Renta' } });
    expect(r.status).toBe(200);
  });

  it('el revisor solo puede leer', async () => {
    const { token } = await login('mama');
    expect((await call('GET', '/categorias', { token })).status).toBe(200);
    expect((await call('GET', '/reports/summary?range=month&currency=MXN', { token })).status).toBe(200);
    for (const [method, path, body] of [
      ['POST', '/categorias', { name: 'X' }],
      ['PUT', '/categorias/1', { name: 'X' }],
      ['DELETE', '/categorias/1'],
      ['POST', '/gastos', { amount: 1 }],
      ['PUT', '/ingresos/2025/8', { amount: 1, currency_code: 'MXN' }],
      ['DELETE', '/ingresos/2025/8'],
      ['PUT', '/users/1/currency', { code: 'AUD' }],
    ]) {
      const r = await call(method, path, { token, body });
      expect(r.status, `${method} ${path}`).toBe(403);
    }
    expect(db.categorias).toEqual([{ id: 1, name: 'Comida' }]);
  });

  it('cada quien cambia solo su propia divisa', async () => {
    const mama = await login('mama');
    const r = await call('PUT', '/users/2/currency', { token: mama.token, body: { code: 'AUD' } });
    expect(r.status).toBe(200);
    expect(r.data).toMatchObject({ id: 2, default_currency_code: 'AUD', role: 'reviewer' });
    expect(r.data.password_hash).toBeUndefined();
    const alex = await login('alex');
    expect((await call('PUT', '/users/2/currency', { token: alex.token, body: { code: 'AUD' } })).status).toBe(403);
    expect((await call('PUT', '/users/1/currency', { token: alex.token, body: { code: 'EUR' } })).status).toBe(400);
  });

  it('rutas inexistentes responden 404 en JSON', async () => {
    const { token } = await login('alex');
    expect((await call('GET', '/nada', { token })).status).toBe(404);
  });
});

describe('revisores', () => {
  it('el dueño crea, lista y elimina revisores', async () => {
    const { token } = await login('alex');
    const created = await call('POST', '/reviewers', { token, body: { username: 'papa', password: 'contraseña1' } });
    expect(created.status).toBe(200);
    expect(created.data).toEqual({ id: 3, username: 'papa' });
    expect(db.usuarios.find((u) => u.id === 3).password_hash).not.toBe('contraseña1');

    const list = await call('GET', '/reviewers', { token });
    expect(list.data).toEqual([
      { id: 2, username: 'mama' },
      { id: 3, username: 'papa' },
    ]);

    // el nuevo revisor puede entrar en modo lectura
    const papa = await login('papa', 'contraseña1');
    expect(papa.role).toBe('reviewer');

    expect((await call('DELETE', '/reviewers/3', { token })).status).toBe(200);
    expect(db.usuarios.some((u) => u.id === 3)).toBe(false);
    expect((await call('GET', '/categorias', { token: papa.token })).status).toBe(401);
    expect((await call('DELETE', '/reviewers/3', { token })).status).toBe(404);
  });

  it('valida usuario y contraseña', async () => {
    const { token } = await login('alex');
    for (const body of [
      { username: 'ab', password: 'contraseña1' },
      { username: 'con espacio', password: 'contraseña1' },
      { username: 'papa', password: 'corta' },
      { username: 'mama', password: 'contraseña1' },
    ]) {
      expect((await call('POST', '/reviewers', { token, body })).status, JSON.stringify(body)).toBe(400);
    }
  });

  it('un revisor no puede gestionar revisores', async () => {
    const { token } = await login('mama');
    expect((await call('GET', '/reviewers', { token })).status).toBe(403);
    expect((await call('POST', '/reviewers', { token, body: { username: 'x1x', password: 'contraseña1' } })).status).toBe(403);
  });

  it('no permite borrar a alguien que no es su revisor', async () => {
    const { token } = await login('alex');
    expect((await call('DELETE', '/reviewers/1', { token })).status).toBe(404);
    expect(db.usuarios).toHaveLength(2);
  });
});
