import React, { useState, useEffect } from 'react';
import CustomInput from './CustomInput.jsx';
import CustomButton from './CustomButton.jsx';
import CustomSelect from './CustomSelect.jsx';
import useCurrencies from '../hooks/useCurrencies.js';
import useCategories from '../hooks/useCategories.js';
import { createExpense } from '../services/api.js';

const recurrenceOptions = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
];

export default function ExpenseForm() {
  const currencies = useCurrencies();
  const categories = useCategories();
  const today = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('monthly');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currency && currencies.length > 0) {
      setCurrency(currencies[0]);
    }
  }, [currencies, currency]);

  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(String(categories[0].id));
    }
  }, [categories, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const payload = {
        amount: parseFloat(amount),
        currency_code: currency,
        category_id: Number(category),
        date,
        description: description || null,
        recurring,
        recurrence_type: recurring ? recurrenceType : null,
        recurrence_end_date: recurring ? endDate || null : null,
      };
      await createExpense(payload);
      setMessage('Gasto registrado');
      setAmount('');
      setDescription('');
      setEndDate('');
    } catch (err) {
      console.error(err);
      setError('No se pudo registrar el gasto');
    }
  };

  // Helper to format date as dd/mm/yyyy
  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper to convert dd/mm/yyyy to yyyy-mm-dd
  const parseDate = (displayDate) => {
    if (!displayDate) return '';
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`;
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className='text-red-500 mb-2'>{error}</p>}
      {message && <p className='text-green-500 mb-2'>{message}</p>}
      <CustomInput
        name='amount'
        id='amount'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder='0.00'
        inputMode='decimal'
        required
      >
        Monto
      </CustomInput>
      <CustomSelect
        name='currency'
        id='currency'
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        options={currencies}
        required
      >
        Divisa
      </CustomSelect>
      <CustomSelect
        name='category'
        id='category'
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
        required
      >
        Categoría
      </CustomSelect>
      <CustomInput
        name='date'
        id='date'
        value={formatDate(date)}
        onChange={(e) => setDate(parseDate(e.target.value))}
        placeholder='dd/mm/aaaa'
        required
      >
        Fecha
      </CustomInput>
      <CustomInput
        name='description'
        id='description'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='Descripción (opcional)'
      >
        Descripción
      </CustomInput>
      <div className='mb-4'>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          />
          <span>Gasto recurrente</span>
        </label>
      </div>
      {recurring && (
        <>
          <CustomInput
            name='endDate'
            id='endDate'
            value={formatDate(endDate)}
            onChange={(e) => setEndDate(parseDate(e.target.value))}
            placeholder='dd/mm/aaaa'
          >
            Fecha fin
          </CustomInput>
          <CustomSelect
            name='recurrenceType'
            id='recurrenceType'
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
            options={recurrenceOptions}
          >
            Tipo de recurrencia
          </CustomSelect>
        </>
      )}
      <CustomButton type='submit' isPrimary>
        Guardar
      </CustomButton>
    </form>
  );
}
