import { vi } from 'vitest';
import { Op } from 'sequelize';

/** Base de datos en memoria para los modelos de Sequelize. */
export const db = { categorias: [], gastos: [], ingresos: [], usuarios: [], revisores: [], historial: [] };

export function resetDb() {
  for (const k of Object.keys(db)) db[k] = [];
}

function matchDate(value, cond) {
  if (!cond) return true;
  if (typeof cond !== 'object' || cond instanceof Date) return String(value) === String(cond);
  if (cond[Op.gte] && !(value >= cond[Op.gte])) return false;
  if (cond[Op.lt] && !(value < cond[Op.lt])) return false;
  return true;
}

function matchWhere(row, where = {}) {
  return Object.entries(where).every(([k, v]) =>
    k === 'date' ? matchDate(row.date, v) : row[k] === v
  );
}

const wrap = (row) => ({
  ...row,
  toJSON: () => ({ ...row }),
  update: vi.fn(async (values) => Object.assign(row, values)),
  // Copia de vuelta los campos modificados en el objeto (no las funciones).
  save: vi.fn(async function save() {
    for (const [k, v] of Object.entries(this)) if (typeof v !== 'function') row[k] = v;
  }),
});

export function model(table) {
  return {
    findAll: vi.fn(async (opts = {}) =>
      db[table].filter((r) => matchWhere(r, opts.where)).map(wrap)
    ),
    findOne: vi.fn(async (opts = {}) => {
      const r = db[table].find((x) => matchWhere(x, opts.where));
      return r ? wrap(r) : null;
    }),
    findByPk: vi.fn(async (id) => {
      const r = db[table].find((x) => x.id === id);
      return r ? wrap(r) : null;
    }),
    create: vi.fn(async (values) => {
      const row = { id: Math.max(0, ...db[table].map((r) => r.id ?? 0)) + 1, ...values };
      db[table].push(row);
      return wrap(row);
    }),
    count: vi.fn(async (opts = {}) => db[table].filter((r) => matchWhere(r, opts.where)).length),
    destroy: vi.fn(async (opts = {}) => {
      const before = db[table].length;
      db[table] = db[table].filter((r) => !matchWhere(r, opts.where));
      return before - db[table].length;
    }),
  };
}
