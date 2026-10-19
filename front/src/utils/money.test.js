import { describe, it, expect } from 'vitest';
import {
  budgetPercentage,
  formatAmount,
  formatCurrency,
  parseAmount,
  roundCents,
  sanitizeAmountInput,
  splitShared,
} from './money.js';

describe('roundCents', () => {
  it.each([
    [5.005, 5.01],
    [1.005, 1.01],
    [2.675, 2.68],
    [0.1 + 0.2, 0.3],
    [1234.565, 1234.57],
    [10, 10],
  ])('%s -> %s', (input, out) => expect(roundCents(input)).toBe(out));
});

describe('sanitizeAmountInput', () => {
  it('acepta coma o punto decimal y hasta 2 decimales', () => {
    expect(sanitizeAmountInput('12,5')).toBe('12.5');
    expect(sanitizeAmountInput('12.50')).toBe('12.50');
    expect(sanitizeAmountInput('')).toBe('');
    expect(sanitizeAmountInput('.')).toBe('.');
  });
  it('rechaza texto inválido', () => {
    expect(sanitizeAmountInput('12.505')).toBeNull();
    expect(sanitizeAmountInput('1.2.3')).toBeNull();
    expect(sanitizeAmountInput('-5')).toBeNull();
    expect(sanitizeAmountInput('abc')).toBeNull();
    expect(sanitizeAmountInput('1e5')).toBeNull();
  });
});

describe('parseAmount', () => {
  it('convierte textos válidos', () => {
    expect(parseAmount('12,5')).toBe(12.5);
    expect(parseAmount('0.99')).toBe(0.99);
    expect(parseAmount('.5')).toBe(0.5);
  });
  it('devuelve NaN para vacío o inválido', () => {
    expect(parseAmount('')).toBeNaN();
    expect(parseAmount('.')).toBeNaN();
    expect(parseAmount('abc')).toBeNaN();
  });
});

describe('splitShared', () => {
  it('divide a la mitad redondeando a centavos', () => {
    expect(splitShared(100)).toBe(50);
    expect(splitShared(10.01)).toBe(5.01);
    expect(splitShared(0.01)).toBe(0.01);
    expect(splitShared(33.33)).toBe(16.67);
  });
});

describe('formatCurrency / formatAmount', () => {
  it('formatea con 2 decimales y separador de miles', () => {
    expect(formatCurrency(1234.5, 'MXN')).toBe('$1,234.50');
    expect(formatAmount(1234.5)).toBe('1,234.50');
    expect(formatAmount(-120)).toBe('-120.00');
  });
  it('no muestra -0', () => {
    expect(formatAmount(-0.001)).toBe('0.00');
    expect(formatCurrency(-0.001, 'MXN')).toBe('$0.00');
  });
  it('muestra guion para valores no numéricos', () => {
    expect(formatCurrency(NaN)).toBe('—');
    expect(formatAmount(undefined)).toBe('—');
  });
  it('incluye la divisa extranjera', () => {
    expect(formatCurrency(6.25, 'AUD')).toMatch(/6\.25/);
    expect(formatCurrency(6.25, 'AUD')).toMatch(/AUD|A\$/);
  });
});

describe('budgetPercentage', () => {
  it('calcula el porcentaje usado', () => {
    expect(budgetPercentage(200, 50)).toBe(25);
    expect(budgetPercentage(100, 150)).toBe(150);
  });
  it('sin presupuesto: 100% si hay gasto, 0% si no', () => {
    expect(budgetPercentage(0, 10)).toBe(100);
    expect(budgetPercentage(0, 0)).toBe(0);
  });
});
