import React, { useState } from 'react';
import CustomInput from './CustomInput.jsx';
import CustomSelect from './CustomSelect.jsx';
import CustomButton from './CustomButton.jsx';
import useCurrencies from '../hooks/useCurrencies.js';
import useCategories from '../hooks/useCategories.js';
import { createExpense } from '../services/api.js';

export default function ExpenseForm() {
  const currencies = useCurrencies();
  const categories = useCategories();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('monthly');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (!currency && currencies.length > 0) {
      setCurrency(currencies[0]);
    }
    if (!category && categories.length > 0) {
      setCategory(String(categories[0].id));
    }
  }, [currencies, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!amount || !currency || !category || !date) {
      setError('Completa todos los campos requeridos');
      return;
    }
    try {
      await createExpense({
        amount: parseFloat(amount),
        currency_code: currency,
        category_id: Number(category),
        date,
        description,
        recurring,
        recurrence_type: recurring ? recurrenceType : undefined,
        recurrence_end_date: recurring ? endDate || null : null,
      });
      setMessage('Gasto registrado');
      setAmount('');
      setDescription('');
      setRecurring(false);
      setEndDate('');
    } catch (err) {
      console.error(err);
      setError('No se pudo registrar el gasto');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className='text-red-500 mb-2'>{error}</p>}
      {message && <p className='text-green-500 mb-2'>{message}</p>}
      <CustomInput
        name='amount'
        id='gasto-amount'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder='Monto'
        inputMode='decimal'
        required
      >
        Monto
      </CustomInput>
      <CustomSelect
        name='currency'
        id='gasto-currency'
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        options={currencies}
        required
      >
        Divisa
      </CustomSelect>
      <CustomSelect
        name='category'
        id='gasto-category'
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
        required
      >
        Categoría
      </CustomSelect>
      <CustomInput
        name='date'
        id='gasto-date'
        type='date'
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      >
        Fecha
      </CustomInput>
      <CustomInput
        name='description'
        id='gasto-desc'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='Descripción opcional'
      >
        Descripción
      </CustomInput>
      <label className='flex items-center gap-2 mb-4'>
        <input
          type='checkbox'
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className='form-checkbox'
        />
        <span>Gasto recurrente</span>
      </label>
      {recurring && (
        <>
          <CustomInput
            name='endDate'
            id='gasto-endDate'
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          >
            Fecha fin
          </CustomInput>
          <CustomSelect
            name='recurrenceType'
            id='gasto-recurrenceType'
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
            options={['monthly', 'weekly']}
            required
          >
            Tipo recurrencia
          </CustomSelect>
        </>
      )}
      <CustomButton type='submit' isPrimary>
        Guardar
      </CustomButton>
    </form>
  );
}
