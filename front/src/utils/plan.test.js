import { describe, it, expect } from 'vitest';
import { PLAN_SPLIT, splitIncome } from './plan.js';
import { roundCents } from './money.js';

describe('splitIncome', () => {
  it('reparte 30/20/50', () => {
    expect(PLAN_SPLIT).toEqual({ invest: 0.3, save: 0.2, spending: 0.5 });
    expect(splitIncome(10000)).toEqual({ income: 10000, invest: 3000, save: 2000, spending: 5000 });
  });
  it('coincide con el backend al redondear', () => {
    // Mismo caso que back/tests/money.test.js
    expect(splitIncome(1234.57)).toEqual({ income: 1234.57, invest: 370.37, save: 246.91, spending: 617.29 });
  });
  it('las partes siempre suman el ingreso', () => {
    for (const a of [0.01, 0.03, 99.99, 33333.33, 57891.01]) {
      const s = splitIncome(a);
      expect(roundCents(s.invest + s.save + s.spending)).toBe(roundCents(a));
    }
  });
});
