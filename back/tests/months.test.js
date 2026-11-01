import { describe, it, expect } from 'vitest';
import {
  currentMonth,
  isValidISODate,
  monthOfDate,
  monthsBetween,
  parseMonthParam,
} from '../utils/months.js';
import { addPeriod } from '../cron/recurringExpenses.js';

describe('currentMonth', () => {
  it('usa la hora de Sídney', () => {
    expect(currentMonth(new Date('2025-06-30T15:00:00Z'))).toEqual({ year: 2025, month: 7 });
    expect(currentMonth(new Date('2025-06-30T13:00:00Z'))).toEqual({ year: 2025, month: 6 });
  });
});

describe('monthOfDate', () => {
  it('usa la fecha guardada (UTC) sin importar la zona del servidor', () => {
    expect(monthOfDate(new Date('2025-07-01T00:00:00Z'))).toEqual({ year: 2025, month: 7 });
    expect(monthOfDate('2025-06-30T00:00:00.000Z')).toEqual({ year: 2025, month: 6 });
  });
});

describe('monthsBetween', () => {
  it('cruza años', () => {
    expect(monthsBetween({ year: 2024, month: 11 }, { year: 2025, month: 2 })).toEqual([
      { year: 2024, month: 11 },
      { year: 2024, month: 12 },
      { year: 2025, month: 1 },
      { year: 2025, month: 2 },
    ]);
  });
});

describe('validaciones de fecha', () => {
  it('parseMonthParam', () => {
    expect(parseMonthParam('2025-07')).toEqual({ year: 2025, month: 7 });
    expect(parseMonthParam('2025-13')).toBeNull();
    expect(parseMonthParam('2025-7')).toBeNull();
    expect(parseMonthParam(undefined)).toBeNull();
  });
  it('isValidISODate', () => {
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2025-02-29')).toBe(false);
    expect(isValidISODate('2025-7-1')).toBe(false);
  });
});

describe('addPeriod (gastos recurrentes)', () => {
  const iso = (d) => d.toISOString().slice(0, 10);
  const d = (s) => new Date(`${s}T00:00:00.000Z`);
  it('suma un mes conservando el día', () => {
    expect(iso(addPeriod(d('2025-07-01'), 'monthly'))).toBe('2025-08-01');
    expect(iso(addPeriod(d('2025-12-15'), 'monthly'))).toBe('2026-01-15');
  });
  it('usa el último día cuando el mes siguiente es más corto', () => {
    expect(iso(addPeriod(d('2025-01-31'), 'monthly'))).toBe('2025-02-28');
    expect(iso(addPeriod(d('2024-01-31'), 'monthly'))).toBe('2024-02-29');
  });
  it('suma una semana', () => {
    expect(iso(addPeriod(d('2025-12-29'), 'weekly'))).toBe('2026-01-05');
  });
});
