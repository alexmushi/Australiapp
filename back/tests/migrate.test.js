import { describe, it, expect, vi, beforeEach } from 'vitest';

const state = { tables: [], syncError: null };

vi.mock('../config/index.js', () => ({
  sequelize: {
    sync: vi.fn(async () => {
      if (state.syncError) throw state.syncError;
    }),
    getQueryInterface: () => ({ showAllTables: async () => state.tables }),
  },
}));
for (const m of ['usuario', 'usuarioRevisor', 'categoria', 'gasto', 'divisa', 'ingreso', 'divisaHistorial']) {
  vi.doMock(`../models/${m}.model.js`, () => ({}));
}

const { REQUIRED_TABLES, explainMigrationError, migrate } = await import('../db/migrate.js');

beforeEach(() => {
  state.tables = [...REQUIRED_TABLES];
  state.syncError = null;
});

describe('migrate', () => {
  it('no reporta faltantes cuando existen todas', async () => {
    expect((await migrate()).missing).toEqual([]);
  });

  it('reporta tablas faltantes (sin importar mayúsculas)', async () => {
    state.tables = ['USUARIOS', 'usuario_revisores', 'Categorias', 'gastos', 'divisas'];
    expect((await migrate()).missing).toEqual(['ingresos', 'divisas_historial']);
  });

  it('acepta el formato de objetos de showAllTables', async () => {
    state.tables = REQUIRED_TABLES.map((t) => ({ tableName: t, schema: 'x' }));
    expect((await migrate()).missing).toEqual([]);
  });

  it('propaga el error de permisos con una pista útil', async () => {
    state.syncError = Object.assign(new Error('denied'), {
      parent: { code: 'ER_TABLEACCESS_DENIED_ERROR', sqlMessage: 'CREATE command denied' },
    });
    const err = await migrate().catch((e) => e);
    const text = explainMigrationError(err);
    expect(text).toContain('CREATE command denied');
    expect(text).toContain('new-tables.sql');
    expect(text).toContain('permiso');
  });
});
