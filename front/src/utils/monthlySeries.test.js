import { describe, it, expect } from 'vitest';
import { monthlySeries } from './monthlySeries.js';
import { convertWithRates } from '../hooks/useRates.js';

const table = {
  months: Array.from({ length: 14 }, (_, i) => ({ year: 2025 + Math.floor((i + 5) / 12), month: ((i + 5) % 12) + 1 })),
  plan: Array.from({ length: 14 }, (_, i) => (i === 13 ? { missing: true, spending: 0 } : { spending: 100 * i })),
  spent: Array.from({ length: 14 }, (_, i) => 10 * i),
  categories: [
    { id: 1, name: 'A', months: Array.from({ length: 14 }, () => 1) },
    { id: 2, name: 'B', months: Array.from({ length: 14 }, () => 2) },
  ],
};

describe('monthlySeries', () => {
  it('con todas: últimos 12 meses, gastado y 50% (sin ingreso = null)', () => {
    const s = monthlySeries(table, ['all']);
    expect(s.months).toHaveLength(12);
    expect(s.months[0]).toEqual(table.months[2]);
    expect(s.spent[0]).toBe(20);
    expect(s.pool.at(-1)).toBeNull();
    expect(s.pool[0]).toBe(200);
  });
  it('con filtro: suma solo las categorías elegidas y sin 50%', () => {
    const s = monthlySeries(table, ['1', '2']);
    expect(s.spent.every((v) => v === 3)).toBe(true);
    expect(s.pool).toBeNull();
    expect(monthlySeries(table, ['2']).spent[0]).toBe(2);
  });
});

describe('convertWithRates', () => {
  const rates = { MXN: 1, AUD: 0.08 };
  it('convierte con tasas por MXN', () => {
    expect(convertWithRates(5, 'AUD', 'MXN', rates)).toBeCloseTo(62.5);
    expect(convertWithRates(125, 'MXN', 'AUD', rates)).toBeCloseTo(10);
    expect(convertWithRates(7, 'AUD', 'AUD', null)).toBe(7);
  });
  it('null si falta una tasa', () => {
    expect(convertWithRates(5, 'GBP', 'MXN', rates)).toBeNull();
    expect(convertWithRates(5, 'AUD', 'MXN', null)).toBeNull();
  });
});
