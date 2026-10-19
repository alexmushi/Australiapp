import { useEffect, useRef, useState } from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import CustomInput from './CustomInput.jsx';
import CustomButton from './CustomButton.jsx';
import CustomSelect from './CustomSelect.jsx';
import Card from './ui/Card.jsx';
import Alert from './ui/Alert.jsx';
import SegmentedControl from './ui/SegmentedControl.jsx';
import { useToast } from './ui/Toast.jsx';
import { createCategory } from '../services/api.js';
import useCurrencies from '../hooks/useCurrencies.js';
import { MONTH_OPTIONS as months } from '../utils/date.js';
import { formatCurrency, parseAmount, sanitizeAmountInput } from '../utils/money.js';
import { hasErrors, validateCategory } from '../utils/validation.js';

const budgetModes = [
  { value: 'recurring', label: 'Mismo monto cada mes' },
  { value: 'monthly', label: 'Monto por mes' },
];

const amountChange = (setter) => (e) => {
  const value = sanitizeAmountInput(e.target.value);
  if (value !== null) setter(value);
};

const yearChange = (setter) => (e) => {
  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
  setter(value);
};

export default function CategoryForm() {
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(true);
  const [amount, setAmount] = useState('');
  const { currencies, error: currenciesError } = useCurrencies();
  const [currency, setCurrency] = useState('');
  const [startMonth, setStartMonth] = useState('1');
  const [startYear, setStartYear] = useState(String(currentYear));
  const [endMonth, setEndMonth] = useState('12');
  const [endYear, setEndYear] = useState(String(currentYear));
  const [budgets, setBudgets] = useState([
    { month: '1', year: String(currentYear), amount: '' },
  ]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const notify = useToast();

  useEffect(() => {
    if (!currency && currencies.length > 0) {
      setCurrency(currencies[0]);
    }
  }, [currencies, currency]);

  const handleAddMonth = () => {
    const last = budgets[budgets.length - 1];
    let m = Number(last.month) + 1;
    let y = Number(last.year) || currentYear;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setBudgets([...budgets, { month: String(m), year: String(y), amount: '' }]);
  };

  const handleRemoveMonth = (idx) => {
    setBudgets((prev) => prev.filter((_, i) => i !== idx));
    setErrors((prev) =>
      prev.budgets ? { ...prev, budgets: prev.budgets.filter((_, i) => i !== idx) } : prev
    );
  };

  const handleBudgetChange = (idx, field, value) => {
    setBudgets((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setSubmitError(null);

    const found = validateCategory({
      name,
      currency,
      recurring,
      amount,
      startMonth,
      startYear,
      endMonth,
      endYear,
      budgets,
    });
    setErrors(found);
    if (hasErrors(found)) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      let payload;
      if (recurring) {
        payload = {
          name: name.trim(),
          description,
          recurring: true,
          amount: parseAmount(amount),
          currency_code: currency,
          start_month: Number(startMonth),
          start_year: Number(startYear),
          end_month: Number(endMonth),
          end_year: Number(endYear),
        };
      } else {
        payload = {
          name: name.trim(),
          description,
          recurring: false,
          currency_code: currency,
          budgets: budgets.map((b) => ({
            month: Number(b.month),
            year: Number(b.year),
            amount: parseAmount(b.amount),
          })),
        };
      }
      await createCategory(payload);
      notify(`“${payload.name}” ya está disponible para registrar gastos.`, {
        title: 'Categoría creada',
      });
      // reset form
      setName('');
      setDescription('');
      setAmount('');
      setCurrency(currencies[0] ?? '');
      setBudgets([{ month: '1', year: String(currentYear), amount: '' }]);
      setErrors({});
    } catch (err) {
      console.error(err);
      setSubmitError(err?.serverMessage || err?.message || 'Error desconocido');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const monthlyTotal = budgets.reduce((s, b) => {
    const n = parseAmount(b.amount);
    return Number.isFinite(n) ? s + n : s;
  }, 0);

  return (
    <form onSubmit={handleSubmit} noValidate className='mx-auto flex max-w-2xl flex-col gap-5'>
      {currenciesError && (
        <Alert title='No se pudieron cargar las divisas'>Revisa tu conexión y recarga la página.</Alert>
      )}
      {submitError && <Alert title='No se pudo crear la categoría'>{submitError}</Alert>}

      <Card title='Categoría'>
        <div className='flex flex-col gap-4'>
          <CustomInput
            name='name'
            id='name'
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            placeholder='Ej. Restaurantes'
            maxLength={50}
            error={errors.name}
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
            maxLength={255}
          >
            Descripción (opcional)
          </CustomInput>
        </div>
      </Card>

      <Card title='Presupuesto' subtitle='Cuánto planeas gastar en esta categoría.'>
        <div className='flex flex-col gap-5'>
          <SegmentedControl
            name='budgetMode'
            label='Tipo de presupuesto'
            value={recurring ? 'recurring' : 'monthly'}
            onChange={(v) => setRecurring(v === 'recurring')}
            options={budgetModes}
            className='w-full sm:w-auto'
          />
          <CustomSelect
            name='currency'
            id='currency'
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={currencies}
            error={errors.currency}
            className='sm:max-w-56'
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
                onChange={amountChange(setAmount)}
                placeholder='0.00'
                inputMode='decimal'
                autoComplete='off'
                maxLength={12}
                suffix={currency}
                error={errors.amount}
                className='sm:max-w-xs'
                inputClassName='tabular-nums'
                required
              >
                Monto mensual
              </CustomInput>
              <div className='grid gap-4 sm:grid-cols-2'>
                <fieldset className='flex flex-col gap-1.5'>
                  <legend className='mb-1.5 text-sm font-medium text-ink-2'>Desde</legend>
                  <div className='grid grid-cols-2 gap-3'>
                    <CustomSelect
                      name='startMonth'
                      id='startMonth'
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      options={months}
                    >
                      <span className='sr-only'>Mes inicio</span>
                    </CustomSelect>
                    <CustomInput
                      name='startYear'
                      id='startYear'
                      value={startYear}
                      onChange={yearChange(setStartYear)}
                      inputMode='numeric'
                      maxLength={4}
                      error={errors.startYear}
                      required
                    >
                      <span className='sr-only'>Año inicio</span>
                    </CustomInput>
                  </div>
                </fieldset>
                <fieldset className='flex flex-col gap-1.5'>
                  <legend className='mb-1.5 text-sm font-medium text-ink-2'>Hasta</legend>
                  <div className='grid grid-cols-2 gap-3'>
                    <CustomSelect
                      name='endMonth'
                      id='endMonth'
                      value={endMonth}
                      onChange={(e) => setEndMonth(e.target.value)}
                      options={months}
                    >
                      <span className='sr-only'>Mes fin</span>
                    </CustomSelect>
                    <CustomInput
                      name='endYear'
                      id='endYear'
                      value={endYear}
                      onChange={yearChange(setEndYear)}
                      inputMode='numeric'
                      maxLength={4}
                      error={errors.endYear}
                      required
                    >
                      <span className='sr-only'>Año fin</span>
                    </CustomInput>
                  </div>
                </fieldset>
              </div>
            </>
          ) : (
            <div className='flex flex-col gap-3'>
              {budgets.map((b, idx) => {
                const rowErr = errors.budgets?.[idx] ?? {};
                return (
                  <div
                    key={idx}
                    className='grid grid-cols-[1fr_1fr_auto] items-start gap-3 rounded-lg border border-line bg-surface-2/50 p-3 sm:grid-cols-[8rem_7rem_1fr_auto]'
                  >
                    <CustomSelect
                      name={`month-${idx}`}
                      id={`month-${idx}`}
                      value={b.month}
                      onChange={(e) => handleBudgetChange(idx, 'month', e.target.value)}
                      options={months}
                      error={rowErr.month}
                    >
                      Mes
                    </CustomSelect>
                    <CustomInput
                      name={`year-${idx}`}
                      id={`year-${idx}`}
                      value={b.year}
                      onChange={yearChange((v) => handleBudgetChange(idx, 'year', v))}
                      inputMode='numeric'
                      maxLength={4}
                      error={rowErr.year}
                      required
                    >
                      Año
                    </CustomInput>
                    <CustomInput
                      name={`amount-${idx}`}
                      id={`amount-${idx}`}
                      value={b.amount}
                      onChange={amountChange((v) => handleBudgetChange(idx, 'amount', v))}
                      placeholder='0.00'
                      inputMode='decimal'
                      autoComplete='off'
                      maxLength={12}
                      error={rowErr.amount}
                      className='col-span-2 sm:col-span-1'
                      inputClassName='tabular-nums'
                      required
                    >
                      Monto
                    </CustomInput>
                    <button
                      type='button'
                      onClick={() => handleRemoveMonth(idx)}
                      disabled={budgets.length === 1}
                      aria-label={`Quitar mes ${idx + 1}`}
                      className='col-start-3 row-start-1 mt-7 flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-bad-soft hover:text-bad disabled:pointer-events-none disabled:opacity-30 sm:col-start-4'
                    >
                      <LuTrash2 aria-hidden />
                    </button>
                  </div>
                );
              })}
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <CustomButton type='button' variant='secondary' size='sm' onClick={handleAddMonth}>
                  <LuPlus aria-hidden />
                  Agregar mes
                </CustomButton>
                <p className='text-sm text-muted'>
                  Total:{' '}
                  <span className='font-semibold text-ink tabular-nums'>
                    {formatCurrency(monthlyTotal, currency || 'MXN')}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className='flex sm:justify-end'>
        <CustomButton
          type='submit'
          isPrimary
          size='lg'
          loading={submitting}
          className='w-full sm:w-auto sm:min-w-44'
        >
          {submitting ? 'Guardando…' : 'Crear categoría'}
        </CustomButton>
      </div>
    </form>
  );
}
