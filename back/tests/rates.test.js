import { describe, it, expect } from 'vitest';
import { isoDay, makeRateBook } from '../utils/rates.js';

describe('makeRateBook', () => {
  const book = makeRateBook({ MXN: 1, AUD: 0.1, USD: 0.05 }, [
    { code: 'AUD', date: '2025-07-10', value: '0.0900' },
    { code: 'AUD', date: '2025-07-01', value: '0.0800' },
    { code: 'AUD', date: '2025-08-01', value: '0.1000' },
  ]);

  it('usa la tasa vigente en la fecha', () => {
    expect(book.rateAt('AUD', '2025-07-01')).toBe(0.08);
    expect(book.rateAt('AUD', '2025-07-09')).toBe(0.08);
    expect(book.rateAt('AUD', '2025-07-10')).toBe(0.09);
    expect(book.rateAt('AUD', '2025-12-31')).toBe(0.1);
  });
  it('antes del historial usa la primera tasa registrada', () => {
    expect(book.rateAt('AUD', '2024-01-01')).toBe(0.08);
  });
  it('sin historial usa la tasa actual', () => {
    expect(book.rateAt('USD', '2025-07-01')).toBe(0.05);
    expect(book.rateAt('MXN', '2025-07-01')).toBe(1);
  });
  it('convierte entre divisas en la misma fecha', () => {
    expect(book.convert(10, 'AUD', 'MXN', '2025-07-01')).toBeCloseTo(125);
    expect(book.convert(100, 'MXN', 'AUD', '2025-08-15')).toBeCloseTo(10);
    expect(book.convert(10, 'AUD', 'USD', '2025-07-01')).toBeCloseTo(6.25);
    expect(book.convert('7.5', 'AUD', 'AUD', '2025-07-01')).toBe(7.5);
  });
  it('falla con divisas desconocidas', () => {
    expect(() => book.convert(1, 'EUR', 'MXN', '2025-07-01')).toThrow('EUR');
    expect(book.has('EUR')).toBe(false);
    expect(book.has('AUD')).toBe(true);
  });
  it('ignora tasas inválidas del historial', () => {
    const b = makeRateBook({ AUD: 0.1 }, [{ code: 'AUD', date: '2025-01-01', value: '0' }]);
    expect(b.rateAt('AUD', '2025-02-01')).toBe(0.1);
  });
  it('isoDay', () => {
    expect(isoDay(new Date('2025-07-01T00:00:00Z'))).toBe('2025-07-01');
    expect(isoDay('2025-07-01')).toBe('2025-07-01');
  });
});
