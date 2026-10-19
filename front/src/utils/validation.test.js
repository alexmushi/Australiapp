import { describe, it, expect } from 'vitest';
import { hasErrors, validateCategory, validateExpense } from './validation.js';

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

const okCategory = {
  name: 'Comida',
  currency: 'MXN',
  recurring: true,
  amount: '100',
  startMonth: '1',
  startYear: '2025',
  endMonth: '12',
  endYear: '2025',
  budgets: [],
};

describe('validateCategory', () => {
  it('acepta una categoría recurrente válida', () => {
    expect(hasErrors(validateCategory(okCategory))).toBe(false);
  });
  it('exige nombre y monto', () => {
    const e = validateCategory({ ...okCategory, name: '  ', amount: '' });
    expect(e.name).toBeTruthy();
    expect(e.amount).toBeTruthy();
  });
  it('rechaza fin anterior al inicio', () => {
    const e = validateCategory({ ...okCategory, startMonth: '6', endMonth: '5' });
    expect(e.endYear).toBeTruthy();
  });
  it('permite inicio y fin en el mismo mes', () => {
    expect(hasErrors(validateCategory({ ...okCategory, startMonth: '5', endMonth: '5' }))).toBe(false);
  });
  it('valida cada mes y rechaza meses repetidos', () => {
    const e = validateCategory({
      ...okCategory,
      recurring: false,
      budgets: [
        { month: '1', year: '2025', amount: '10' },
        { month: '1', year: '2025', amount: '20' },
        { month: '2', year: '25', amount: '' },
      ],
    });
    expect(e.budgets[0]).toEqual({});
    expect(e.budgets[1].month).toBeTruthy();
    expect(e.budgets[2].year).toBeTruthy();
    expect(e.budgets[2].amount).toBeTruthy();
    expect(hasErrors(e)).toBe(true);
  });
});
