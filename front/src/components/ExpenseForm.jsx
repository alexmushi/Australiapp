import { useEffect, useRef, useState } from 'react';
import CustomInput from './CustomInput.jsx';
import CustomButton from './CustomButton.jsx';
import CustomSelect from './CustomSelect.jsx';
import Card from './ui/Card.jsx';
import Alert from './ui/Alert.jsx';
import Switch from './ui/Switch.jsx';
import SegmentedControl from './ui/SegmentedControl.jsx';
import { useToast } from './ui/Toast.jsx';
import useCurrencies from '../hooks/useCurrencies.js';
import useCategories from '../hooks/useCategories.js';
import { createExpense } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ExpenseBudgetHint from './ExpenseBudgetHint.jsx';
import { isValidISODate, todayISO } from '../utils/date.js';
import { formatCurrency, parseAmount, sanitizeAmountInput, splitShared } from '../utils/money.js';
import { hasErrors, validateExpense } from '../utils/validation.js';

// Última categoría y divisa usadas, para no elegirlas cada vez.
const LAST_KEY = 'expense_last_selection';

function readLast() {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveLast(patch) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ ...readLast(), ...patch }));
  } catch {
    // almacenamiento no disponible
  }
}

const recurrenceOptions = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
];

export default function ExpenseForm() {
  const { currencies, error: currenciesError } = useCurrencies();
  const { categories, error: categoriesError, loading: categoriesLoading } = useCategories();
  const notify = useToast();
  const { user } = useAuth();
  const [statusKey, setStatusKey] = useState(0);
  const amountRef = useRef(null);
  const submittingRef = useRef(false);

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => todayISO());
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [shared, setShared] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('monthly');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currency && currencies.length > 0) {
      const last = readLast().currency;
      setCurrency(currencies.includes(last) ? last : currencies[0]);
    }
  }, [currencies, currency]);

  useEffect(() => {
    if (!category && categories.length > 0) {
      const last = readLast().category;
      const known = categories.some((c) => String(c.id) === last);
      setCategory(known ? last : String(categories[0].id));
    }
  }, [categories, category]);

  const numericAmount = parseAmount(amount);
  const amountToSave = Number.isFinite(numericAmount)
    ? shared
      ? splitShared(numericAmount)
      : numericAmount
    : null;

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Evita registros duplicados por doble clic, incluso antes de re-renderizar.
    if (submittingRef.current) return;
    setSubmitError(null);

    const found = validateExpense({ amount, currency, category, date, recurring, endDate });
    setErrors(found);
    if (hasErrors(found)) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const payload = {
        amount: amountToSave,
        currency_code: currency,
        category_id: Number(category),
        date,
        description: description.trim() || null,
        recurring,
        recurrence_type: recurring ? recurrenceType : null,
        recurrence_end_date: recurring ? endDate || null : null,
      };
      await createExpense(payload);
      const catName = categories.find((c) => String(c.id) === category)?.name;
      notify(`${formatCurrency(amountToSave, currency)}${catName ? ` en ${catName}` : ''}`, {
        title: 'Gasto registrado',
      });
      setAmount('');
      setDescription('');
      setEndDate('');
      setErrors({});
      setStatusKey((k) => k + 1);
      amountRef.current?.querySelector('input')?.focus();
    } catch (err) {
      console.error(err);
      setSubmitError(err?.serverMessage || err?.message || 'Error desconocido');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const loadError = currenciesError || categoriesError;
  const noCategories = !categoriesLoading && !categoriesError && categories.length === 0;

  return (
    <form onSubmit={handleSubmit} noValidate className='mx-auto flex max-w-2xl flex-col gap-5'>
      {loadError && (
        <Alert title='No se pudieron cargar los datos'>
          Revisa tu conexión y recarga la página.
        </Alert>
      )}
      {noCategories && (
        <Alert tone='warning' title='Aún no hay categorías'>
          Crea una categoría antes de registrar gastos.
        </Alert>
      )}
      {submitError && (
        <Alert title='No se pudo registrar el gasto'>{submitError}</Alert>
      )}

      <Card title='Detalles del gasto'>
        <div className='flex flex-col gap-4'>
          <div className='grid grid-cols-[1fr_7rem] gap-3 sm:grid-cols-[1fr_9rem]'>
            <div ref={amountRef}>
              <CustomInput
                name='amount'
                id='amount'
                value={amount}
                onChange={(e) => {
                  const value = sanitizeAmountInput(e.target.value);
                  if (value !== null) {
                    setAmount(value);
                    clearError('amount');
                  }
                }}
                placeholder='0.00'
                inputMode='decimal'
                autoComplete='off'
                maxLength={12}
                error={errors.amount}
                inputClassName='!h-12 !text-lg font-semibold tabular-nums'
                required
              >
                Monto
              </CustomInput>
            </div>
            <CustomSelect
              name='currency'
              id='currency'
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                saveLast({ currency: e.target.value });
                clearError('currency');
              }}
              options={currencies}
              error={errors.currency}
              required
            >
              Divisa
            </CustomSelect>
          </div>

          <CustomSelect
            name='category'
            id='category'
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              saveLast({ category: e.target.value });
              clearError('category');
            }}
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            placeholder={categories.length ? undefined : 'Sin categorías'}
            error={errors.category}
            required
          >
            Categoría
          </CustomSelect>

          <div className='grid gap-4 sm:grid-cols-2'>
            <CustomInput
              name='date'
              id='date'
              type='date'
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                clearError('date');
              }}
              error={errors.date}
              required
            >
              Fecha
            </CustomInput>
            <CustomInput
              name='description'
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Ej. Supermercado'
              maxLength={255}
            >
              Descripción (opcional)
            </CustomInput>
          </div>
        </div>
      </Card>

      {isValidISODate(date) && user && (
        <ExpenseBudgetHint
          month={date.slice(0, 7)}
          amount={amountToSave ?? undefined}
          currency={currency}
          displayCurrency={user.default_currency_code || 'MXN'}
          categoryId={category}
          categoryName={categories.find((c) => String(c.id) === category)?.name}
          refreshKey={statusKey}
        />
      )}

      <Card title='Opciones' bodyClassName='p-4 sm:p-5 flex flex-col divide-y divide-line'>
        <div className='pb-3'>
          <Switch
            id='shared'
            checked={shared}
            onChange={setShared}
            label='Gasto compartido'
            description={
              shared && amountToSave
                ? `Se registrará tu mitad: ${formatCurrency(amountToSave, currency || 'MXN')}`
                : 'Se registra solo la mitad del monto.'
            }
          />
        </div>
        <div className='pt-3'>
          <Switch
            id='recurring'
            checked={recurring}
            onChange={setRecurring}
            label='Gasto recurrente'
            description='Se repetirá automáticamente.'
          />
          {recurring && (
            <div className='mt-3 grid gap-4 sm:grid-cols-2'>
              <div className='flex flex-col gap-1.5'>
                <span className='text-sm font-medium text-ink-2'>Tipo de recurrencia</span>
                <SegmentedControl
                  name='recurrenceType'
                  label='Tipo de recurrencia'
                  value={recurrenceType}
                  onChange={setRecurrenceType}
                  options={recurrenceOptions}
                  className='w-full'
                />
              </div>
              <CustomInput
                name='endDate'
                id='endDate'
                type='date'
                value={endDate}
                min={date}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  clearError('endDate');
                }}
                error={errors.endDate}
                hint='Déjala vacía para repetir sin fin.'
              >
                Fecha fin (opcional)
              </CustomInput>
            </div>
          )}
        </div>
      </Card>

      <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end'>
        <CustomButton
          type='submit'
          isPrimary
          size='lg'
          loading={submitting}
          disabled={noCategories}
          className='w-full sm:w-auto sm:min-w-44'
        >
          {submitting ? 'Guardando…' : 'Guardar gasto'}
        </CustomButton>
      </div>
    </form>
  );
}
