import { describe, it, expect } from 'vitest';
import { convert, parseMoney, roundCents, splitIncome } from '../utils/money.js';

describe('splitIncome', () => {
  it('reparte 30/20/50', () => {
    expect(splitIncome(10000)).toEqual({ income: 10000, invest: 3000, save: 2000, spending: 5000 });
  });
  it('las partes siempre suman el ingreso exacto', () => {
    for (const amount of [0.01, 0.03, 99.99, 1234.57, 33333.33, 57891.01, 99999999.99]) {
      const s = splitIncome(amount);
      expect(roundCents(s.invest + s.save + s.spending)).toBe(roundCents(amount));
      expect(Math.abs(s.invest - amount * 0.3)).toBeLessThanOrEqual(0.005 + 1e-9);
      expect(Math.abs(s.save - amount * 0.2)).toBeLessThanOrEqual(0.005 + 1e-9);
    }
  });
  it('redondea a centavos', () => {
    expect(splitIncome(1234.57)).toEqual({ income: 1234.57, invest: 370.37, save: 246.91, spending: 617.29 });
  });
});

describe('convert', () => {
  const rates = { MXN: 1, AUD: 0.08 };
  it('convierte con tasas por MXN', () => {
    expect(convert(10, 'AUD', 'MXN', rates)).toBeCloseTo(125);
    expect(convert(125, 'MXN', 'AUD', rates)).toBeCloseTo(10);
    expect(convert('7.5', 'AUD', 'AUD', rates)).toBe(7.5);
  });
  it('falla si falta la tasa en vez de devolver NaN', () => {
    expect(() => convert(1, 'GBP', 'MXN', rates)).toThrow('GBP');
    expect(() => convert(1, 'MXN', 'XXX', rates)).toThrow('XXX');
  });
});

describe('parseMoney', () => {
  it('acepta números y textos numéricos y redondea', () => {
    expect(parseMoney(12.345)).toEqual({ value: 12.35 });
    expect(parseMoney('10.5')).toEqual({ value: 10.5 });
  });
  it.each([0, -1, NaN, Infinity, '', 'abc', null, undefined, 100000000, true])('rechaza %s', (v) => {
    expect(parseMoney(v).error).toBeTruthy();
  });
});
