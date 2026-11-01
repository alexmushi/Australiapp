import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db, resetDb } from './mockDb.js';

vi.mock('../models/divisa.model.js', async () => {
  const { db: mdb } = await import('./mockDb.js');
  return {
    Divisa: {
      findAll: vi.fn(async () => mdb.divisas.map((d) => ({ ...d }))),
      update: vi.fn(async (values, { where }) => {
        mdb.divisas.filter((d) => d.code === where.code).forEach((d) => Object.assign(d, values));
      }),
    },
  };
});
vi.mock('../models/divisaHistorial.model.js', async () => ({
  DivisaHistorial: (await import('./mockDb.js')).model('historial'),
}));

const { ensureRateSnapshot, getRateBook, updateDivisaValues } = await import('../services/divisaService.js');

beforeEach(() => {
  resetDb();
  db.divisas = [
    { code: 'MXN', value: '1.0000' },
    { code: 'AUD', value: '0.0800' },
  ];
});

const NOW = new Date('2025-08-15T02:00:00Z'); // 15 ago en Sídney

describe('historial de tipos de cambio', () => {
  it('guarda el tipo de cambio de hoy al arrancar, una sola vez', async () => {
    await ensureRateSnapshot(NOW);
    await ensureRateSnapshot(NOW);
    expect(db.historial.map((h) => [h.code, h.date, h.value])).toEqual([
      ['MXN', '2025-08-15', 1],
      ['AUD', '2025-08-15', 0.08],
    ]);
  });

  it('el cron actualiza la tasa actual y la del día', async () => {
    await ensureRateSnapshot(NOW);
    await updateDivisaValues({ MXN: 1, AUD: 0.09 }, NOW);
    expect(db.divisas.find((d) => d.code === 'AUD').value).toBe(0.09);
    expect(db.historial.filter((h) => h.code === 'AUD')).toEqual([
      expect.objectContaining({ date: '2025-08-15', value: 0.09 }),
    ]);
    await updateDivisaValues({ AUD: 0.1 }, new Date('2025-08-16T02:00:00Z'));
    const book = await getRateBook();
    expect(book.rateAt('AUD', '2025-08-15')).toBe(0.09);
    expect(book.rateAt('AUD', '2025-08-16')).toBe(0.1);
    expect(book.rateAt('AUD', '2025-01-01')).toBe(0.09);
  });

  it('ignora tasas inválidas', async () => {
    await updateDivisaValues({ AUD: 0, USD: NaN }, NOW);
    expect(db.historial).toEqual([]);
  });
});
