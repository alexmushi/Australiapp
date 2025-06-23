import React, { useState } from 'react';
import CustomInput from './CustomInput.jsx';
import CustomButton from './CustomButton.jsx';
import CustomSelect from './CustomSelect.jsx';
import { createCategory } from '../services/api.js';
import useCurrencies from '../hooks/useCurrencies.js';

const months = [
  { value: '1', label: 'ENE' },
  { value: '2', label: 'FEB' },
  { value: '3', label: 'MAR' },
  { value: '4', label: 'ABR' },
  { value: '5', label: 'MAY' },
  { value: '6', label: 'JUN' },
  { value: '7', label: 'JUL' },
  { value: '8', label: 'AGO' },
  { value: '9', label: 'SEP' },
  { value: '10', label: 'OCT' },
  { value: '11', label: 'NOV' },
  { value: '12', label: 'DIC' },
];

export default function CategoryForm() {
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(true);
  const [amount, setAmount] = useState('');
  const currencies = useCurrencies();
  const [currency, setCurrency] = useState('');
  const [startMonth, setStartMonth] = useState('1');
  const [startYear, setStartYear] = useState(String(currentYear));
  const [endMonth, setEndMonth] = useState('12');
  const [endYear, setEndYear] = useState(String(currentYear));
  const [budgets, setBudgets] = useState([
    { month: '1', year: String(currentYear), amount: '' },
  ]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (!currency && currencies.length > 0) {
      setCurrency(currencies[0]);
    }
  }, [currencies, currency]);

  const handleAddMonth = () => {
    const last = budgets[budgets.length - 1];
    let m = Number(last.month) + 1;
    let y = Number(last.year);
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setBudgets([...budgets, { month: String(m), year: String(y), amount: '' }]);
  };

  const handleBudgetChange = (idx, field, value) => {
    setBudgets((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      let payload;
      if (recurring) {
        payload = {
          name,
          description,
          recurring: true,
          amount: parseFloat(amount),
          currency_code: currency,
          start_month: Number(startMonth),
          start_year: Number(startYear),
          end_month: Number(endMonth),
          end_year: Number(endYear),
        };
      } else {
        payload = {
          name,
          description,
          recurring: false,
          budgets: budgets.map((b) => ({
            month: Number(b.month),
            year: Number(b.year),
            amount: parseFloat(b.amount),
            currency_code: currency,
          })),
        };
      }
      await createCategory(payload);
      setMessage('Categoría creada');
      // reset form
      setName('');
      setDescription('');
      setAmount('');
      setCurrency(currencies[0] ?? '');
      setBudgets([{ month: '1', year: String(currentYear), amount: '' }]);
    } catch (err) {
      console.error(err);
      setError('No se pudo crear la categoría');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className='text-red-500 mb-2'>{error}</p>}
      {message && <p className='text-green-500 mb-2'>{message}</p>}
      <CustomInput
        name='name'
        id='name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Nombre de categoría'
        required
      >
        Nombre
      </CustomInput>
      <CustomInput
        name='description'
        id='description'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='Descripción opcional'
      >
        Descripción
      </CustomInput>
      <div className='my-4'>
        <label className='flex items-center gap-2'>
          <md-checkbox
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          ></md-checkbox>
          <span>Presupuesto recurrente</span>
        </label>
      </div>
        <CustomSelect
        name='currency'
        id='currency'
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        options={currencies}
        required
      >
        Divisa del presupuesto
      </CustomSelect>
      {recurring ? (
        <>
          <CustomInput
            name='amount'
            id='amount'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='Monto'
            inputMode='decimal'
            required
          >
            Monto mensual
          </CustomInput>
          <div className='flex gap-4'>
            <CustomSelect
              name='startMonth'
              id='startMonth'
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              options={months}
            >
              Mes inicio
            </CustomSelect>
            <CustomInput
              name='startYear'
              id='startYear'
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              inputMode='numeric'
              required
            >
              Año inicio
            </CustomInput>
          </div>
          <div className='flex gap-4'>
            <CustomSelect
              name='endMonth'
              id='endMonth'
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              options={months}
            >
              Mes fin
            </CustomSelect>
            <CustomInput
              name='endYear'
              id='endYear'
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              inputMode='numeric'
              required
            >
              Año fin
            </CustomInput>
          </div>
        </>
      ) : (
        <>
          {budgets.map((b, idx) => (
            <div key={idx} className='border p-2 mb-2'>
              <CustomInput
                name={`amount-${idx}`}
                id={`amount-${idx}`}
                value={b.amount}
                onChange={(e) => handleBudgetChange(idx, 'amount', e.target.value)}
                placeholder='Monto'
                inputMode='decimal'
                required
              >
                Monto
              </CustomInput>
              <div className='flex gap-4'>
                <CustomSelect
                  name={`month-${idx}`}
                  id={`month-${idx}`}
                  value={b.month}
                  onChange={(e) => handleBudgetChange(idx, 'month', e.target.value)}
                  options={months}
                >
                  Mes
                </CustomSelect>
                <CustomInput
                  name={`year-${idx}`}
                  id={`year-${idx}`}
                  value={b.year}
                  onChange={(e) => handleBudgetChange(idx, 'year', e.target.value)}
                  inputMode='numeric'
                  required
                >
                  Año
                </CustomInput>
              </div>
            </div>
          ))}
          <CustomButton type='button' onClick={handleAddMonth}>
            Agregar mes
          </CustomButton>
        </>
      )}
      <CustomButton type='submit' isPrimary>
        Guardar
      </CustomButton>
    </form>
  );
}

