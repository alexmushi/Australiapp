import React, { useState } from 'react';
import CustomInput from './CustomInput.jsx';
import CustomButton from './CustomButton.jsx';
import { createCategory } from '../services/api.js';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('variable'); // 'variable' or 'recurring'
  const [entries, setEntries] = useState([
    { amount: '', month: '', year: '' },
  ]);
  const [recAmount, setRecAmount] = useState('');
  const [recStartMonth, setRecStartMonth] = useState('');
  const [recStartYear, setRecStartYear] = useState('');
  const [recEndMonth, setRecEndMonth] = useState('');
  const [recEndYear, setRecEndYear] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleEntryChange = (index, field, value) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, { amount: '', month: '', year: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      let payload;
      if (type === 'variable') {
        const budgets = entries.map((e) => ({
          amount: Number(e.amount),
          period_month: Number(e.month),
          period_year: Number(e.year),
        }));
        payload = { name, description, recurring: false, budgets };
      } else {
        const budgets = [
          {
            amount: Number(recAmount),
            period_month: Number(recStartMonth),
            period_year: Number(recStartYear),
          },
        ];
        const endDate = `${recEndYear}-${String(recEndMonth).padStart(2, '0')}-01`;
        payload = {
          name,
          description,
          recurring: true,
          recurrence_end_date: endDate,
          budgets,
        };
      }
      await createCategory(payload);
      setMessage('Categoría creada');
      setName('');
      setDescription('');
      setEntries([{ amount: '', month: '', year: '' }]);
      setRecAmount('');
      setRecStartMonth('');
      setRecStartYear('');
      setRecEndMonth('');
      setRecEndYear('');
    } catch (err) {
      console.error(err);
      setError('No se pudo crear');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className='text-red-500 mb-2'>{error}</p>}
      {message && <p className='text-green-500 mb-2'>{message}</p>}
      <CustomInput
        name='name'
        id='cat-name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Nombre'
        required
      >
        Nombre
      </CustomInput>
      <CustomInput
        name='description'
        id='cat-desc'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='Descripción'
      >
        Descripción
      </CustomInput>
      <div className='my-4'>
        <label className='block text-sm font-medium text-white-700'>Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className='mt-1 block w-full p-2 border-b-2 border-gray-300 bg-transparent text-white'
        >
          <option value='variable' className='text-black'>Variable por mes</option>
          <option value='recurring' className='text-black'>Mismo cada mes</option>
        </select>
      </div>
      {type === 'variable' ? (
        <div>
          {entries.map((entry, i) => (
            <div key={i} className='border p-2 mb-2'>
              <CustomInput
                name={`amount-${i}`}
                id={`amount-${i}`}
                value={entry.amount}
                onChange={(e) => handleEntryChange(i, 'amount', e.target.value)}
                placeholder='Monto'
                inputMode='decimal'
                required
              >
                Monto
              </CustomInput>
              <CustomInput
                name={`month-${i}`}
                id={`month-${i}`}
                value={entry.month}
                onChange={(e) => handleEntryChange(i, 'month', e.target.value)}
                placeholder='Mes (1-12)'
                inputMode='numeric'
                required
              >
                Mes
              </CustomInput>
              <CustomInput
                name={`year-${i}`}
                id={`year-${i}`}
                value={entry.year}
                onChange={(e) => handleEntryChange(i, 'year', e.target.value)}
                placeholder='Año'
                inputMode='numeric'
                required
              >
                Año
              </CustomInput>
            </div>
          ))}
          <CustomButton type='button' onClick={addEntry}>Añadir mes</CustomButton>
        </div>
      ) : (
        <div className='border p-2 mb-2'>
          <CustomInput
            name='rec-amount'
            id='rec-amount'
            value={recAmount}
            onChange={(e) => setRecAmount(e.target.value)}
            placeholder='Monto'
            inputMode='decimal'
            required
          >
            Monto mensual
          </CustomInput>
          <CustomInput
            name='rec-start-month'
            id='rec-start-month'
            value={recStartMonth}
            onChange={(e) => setRecStartMonth(e.target.value)}
            placeholder='Mes inicio'
            inputMode='numeric'
            required
          >
            Mes inicio
          </CustomInput>
          <CustomInput
            name='rec-start-year'
            id='rec-start-year'
            value={recStartYear}
            onChange={(e) => setRecStartYear(e.target.value)}
            placeholder='Año inicio'
            inputMode='numeric'
            required
          >
            Año inicio
          </CustomInput>
          <CustomInput
            name='rec-end-month'
            id='rec-end-month'
            value={recEndMonth}
            onChange={(e) => setRecEndMonth(e.target.value)}
            placeholder='Mes fin'
            inputMode='numeric'
            required
          >
            Mes fin
          </CustomInput>
          <CustomInput
            name='rec-end-year'
            id='rec-end-year'
            value={recEndYear}
            onChange={(e) => setRecEndYear(e.target.value)}
            placeholder='Año fin'
            inputMode='numeric'
            required
          >
            Año fin
          </CustomInput>
        </div>
      )}
      <CustomButton type='submit' isPrimary>
        Guardar
      </CustomButton>
    </form>
  );
}
