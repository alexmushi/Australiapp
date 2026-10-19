import { describe, it, expect } from 'vitest';
import { currentMonthISO, formatDate, isValidISODate, monthLabel, shiftMonth, toMonthISO, todayISO } from './date.js';

describe('formatDate', () => {
  it('formatea fechas simples', () => {
    expect(formatDate('2025-07-01')).toBe('01/07/2025');
  });
  it('formatea fechas con hora sin cambiar el día', () => {
    expect(formatDate('2025-07-01T00:00:00.000Z')).toBe('01/07/2025');
  });
  it('devuelve vacío para valores inválidos', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate('hola')).toBe('');
  });
});

describe('todayISO / currentMonthISO', () => {
  it('usan la zona horaria de Sídney', () => {
    // 30 jun 2025 15:00 UTC = 1 jul 2025 01:00 en Sídney
    const now = new Date('2025-06-30T15:00:00Z');
    expect(todayISO(undefined, now)).toBe('2025-07-01');
    expect(currentMonthISO(undefined, now)).toBe('2025-07');
  });
});

describe('isValidISODate', () => {
  it('valida fechas reales', () => {
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2025-02-29')).toBe(false);
    expect(isValidISODate('2025-13-01')).toBe(false);
    expect(isValidISODate('01/07/2025')).toBe(false);
    expect(isValidISODate('')).toBe(false);
  });
});

describe('monthLabel', () => {
  it('nombra el mes', () => {
    expect(monthLabel('2025-07')).toBe('julio 2025');
    expect(monthLabel('2025-13')).toBe('');
  });
});

describe('shiftMonth / toMonthISO', () => {
  it('mueve meses cruzando años', () => {
    expect(shiftMonth('2025-01', -1)).toBe('2024-12');
    expect(shiftMonth('2025-12', 1)).toBe('2026-01');
    expect(shiftMonth('2025-07', -13)).toBe('2024-06');
  });
  it('formatea periodos', () => {
    expect(toMonthISO({ year: 2025, month: 7 })).toBe('2025-07');
  });
});
