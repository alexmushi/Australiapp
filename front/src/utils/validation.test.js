import { describe, it, expect } from 'vitest';
import { amountError, hasErrors, validateExpense } from './validation.js';

const okExpense = {
  amount: '10',
  currency: 'AUD',
  category: '1',
  date: '2025-07-01',
  recurring: false,
  endDate: '',
};

describe('validateExpense', () => {
  it('acepta un gasto válido', () => {
    expect(hasErrors(validateExpense(okExpense))).toBe(false);
  });
  it.each([
    [{ amount: '' }, 'amount'],
    [{ amount: '0' }, 'amount'],
    [{ amount: '.' }, 'amount'],
    [{ amount: '100000000' }, 'amount'],
    [{ currency: '' }, 'currency'],
    [{ category: '' }, 'category'],
    [{ date: '' }, 'date'],
    [{ date: '2025-02-30' }, 'date'],
    [{ recurring: true, endDate: '2025-06-30' }, 'endDate'],
  ])('rechaza %o', (patch, field) => {
    const errors = validateExpense({ ...okExpense, ...patch });
    expect(errors[field]).toBeTruthy();
  });
  it('ignora la fecha fin si no es recurrente', () => {
    expect(hasErrors(validateExpense({ ...okExpense, endDate: '2000-01-01' }))).toBe(false);
  });
});

describe('amountError', () => {
  it('usa la etiqueta indicada', () => {
    expect(amountError('', { label: 'lo que ganaste' })).toBe('Ingresa lo que ganaste.');
    expect(amountError('12.5')).toBeUndefined();
  });
});
