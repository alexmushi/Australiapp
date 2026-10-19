import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LuPencil, LuPiggyBank, LuTrash2, LuTrendingUp, LuWallet } from 'react-icons/lu';
import CustomInput from './CustomInput.jsx';
import CustomButton from './CustomButton.jsx';
import CustomSelect from './CustomSelect.jsx';
import Card from './ui/Card.jsx';
import Alert from './ui/Alert.jsx';
import EmptyState from './ui/EmptyState.jsx';
import MonthStepper from './ui/MonthStepper.jsx';
import { useToast } from './ui/Toast.jsx';
import useCurrencies from '../hooks/useCurrencies.js';
import useIncomes from '../hooks/useIncomes.js';
import { deleteIncome, saveIncome } from '../services/api.js';
import { currentMonthISO, monthLabel, shiftMonth, toMonthISO } from '../utils/date.js';
import { formatCurrency, parseAmount, sanitizeAmountInput } from '../utils/money.js';
import { PLAN_LABELS, splitIncome } from '../utils/plan.js';
import { amountError } from '../utils/validation.js';

const incomeMonth = (inc) => toMonthISO({ year: inc.period_year, month: inc.period_month });

function SplitPreview({ amount, currency }) {
  const split = splitIncome(Number.isFinite(amount) ? amount : 0);
  const fmt = (v) => formatCurrency(v, currency || 'MXN');
  const items = [
    { key: 'invest', pct: '30%', icon: LuTrendingUp, tone: 'text-primary' },
    { key: 'save', pct: '20%', icon: LuPiggyBank, tone: 'text-good' },
    { key: 'spending', pct: '50%', icon: LuWallet, tone: 'text-warn' },
  ];
  return (
    <ul className='grid gap-2 sm:grid-cols-3' aria-label='Reparto del ingreso'>
      {items.map(({ key, pct, icon: Icon, tone }) => (
        <li key={key} className='rounded-lg bg-surface-2 px-3 py-3'>
          <p className='flex items-center gap-1.5 text-xs font-medium text-muted'>
            <Icon aria-hidden className={tone} />
            {PLAN_LABELS[key]} · {pct}
          </p>
          <p className='mt-0.5 text-lg font-semibold tabular-nums text-ink' data-testid={`split-${key}`}>
            {fmt(split[key])}
          </p>
        </li>
      ))}
    </ul>
  );
}

SplitPreview.propTypes = { amount: PropTypes.number, currency: PropTypes.string };

export default function IncomeForm() {
  const { currencies, error: currenciesError } = useCurrencies();
  const { incomes, error: incomesError, loading: incomesLoading, reload } = useIncomes();
  const notify = useToast();
  const submittingRef = useRef(false);
  const formRef = useRef(null);

  const [budgetMonth, setBudgetMonth] = useState(() => currentMonthISO());
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState();
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const loadedFor = useRef(null);

  const existing = incomes.find((i) => incomeMonth(i) === budgetMonth);

  // Al cambiar de mes (o al llegar la lista), carga el ingreso guardado de ese mes.
  useEffect(() => {
    if (incomesLoading || loadedFor.current === budgetMonth) return;
    loadedFor.current = budgetMonth;
    const found = incomes.find((i) => incomeMonth(i) === budgetMonth);
    setAmount(found ? String(found.amount) : '');
    setDescription(found?.description ?? '');
    if (found) setCurrency(found.currency_code);
    setError(undefined);
    setSubmitError(null);
  }, [budgetMonth, incomes, incomesLoading]);

  // Divisa por defecto: la del último ingreso registrado, si no la primera.
  useEffect(() => {
    if (currency || incomesLoading || currencies.length === 0) return;
    const last = incomes[0]?.currency_code;
    setCurrency(last && currencies.includes(last) ? last : currencies[0]);
  }, [currencies, currency, incomes, incomesLoading]);

  const earnedMonth = shiftMonth(budgetMonth, -1);
  const numeric = parseAmount(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setSubmitError(null);
    const err = amountError(amount, { label: 'lo que ganaste' }) ?? (!currency ? 'Elige una divisa.' : undefined);
    setError(err);
    if (err) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const [year, month] = budgetMonth.split('-').map(Number);
      await saveIncome(year, month, {
        amount: numeric,
        currency_code: currency,
        description: description.trim() || null,
      });
      const split = splitIncome(numeric);
      notify(`${monthLabel(budgetMonth)}: ${formatCurrency(split.spending, currency)} para gastos.`, {
        title: existing ? 'Ingreso actualizado' : 'Ingreso registrado',
      });
      loadedFor.current = budgetMonth; // conserva lo escrito tras recargar
      reload();
    } catch (err2) {
      console.error(err2);
      setSubmitError(err2?.serverMessage || err2?.message || 'Error desconocido');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleEdit = (inc) => {
    loadedFor.current = incomeMonth(inc);
    setBudgetMonth(incomeMonth(inc));
    setAmount(String(inc.amount));
    setCurrency(inc.currency_code);
    setDescription(inc.description ?? '');
    setError(undefined);
    setSubmitError(null);
    formRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (inc) => {
    try {
      await deleteIncome(inc.period_year, inc.period_month);
      notify(`Se eliminó el ingreso de ${monthLabel(incomeMonth(inc))}.`, { title: 'Ingreso eliminado' });
      if (incomeMonth(inc) === budgetMonth) {
        setAmount('');
        setDescription('');
      }
      setConfirmDelete(null);
      reload();
    } catch (err) {
      console.error(err);
      notify(err?.serverMessage || 'No se pudo eliminar el ingreso.', { tone: 'error' });
    }
  };

  return (
    <div className='mx-auto flex max-w-2xl flex-col gap-5'>
      {(currenciesError || incomesError) && (
        <Alert title='No se pudieron cargar los datos'>Revisa tu conexión y recarga la página.</Alert>
      )}
      {submitError && <Alert title='No se pudo guardar el ingreso'>{submitError}</Alert>}

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <Card
          title={`¿Cuánto ganaste en ${monthLabel(earnedMonth)}?`}
          subtitle={`Se reparte para tu presupuesto de ${monthLabel(budgetMonth)}: 30% invertir, 20% ahorrar y 50% para gastos.`}
        >
          <div className='flex flex-col gap-5'>
            <div className='flex flex-col gap-1.5'>
              <span className='text-sm font-medium text-ink-2'>Presupuesto de</span>
              <div className='flex flex-wrap items-center gap-3'>
                <MonthStepper value={budgetMonth} onChange={setBudgetMonth} label='Mes del presupuesto' />
                {existing && (
                  <span className='rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary'>
                    Ya registrado · editando
                  </span>
                )}
              </div>
            </div>

            <div className='grid grid-cols-[1fr_7rem] gap-3 sm:grid-cols-[1fr_9rem]'>
              <CustomInput
                name='income'
                id='income'
                value={amount}
                onChange={(e) => {
                  const v = sanitizeAmountInput(e.target.value);
                  if (v !== null) {
                    setAmount(v);
                    setError(undefined);
                  }
                }}
                placeholder='0.00'
                inputMode='decimal'
                autoComplete='off'
                maxLength={12}
                error={error}
                inputClassName='!h-12 !text-lg font-semibold tabular-nums'
                required
              >
                Ingreso
              </CustomInput>
              <CustomSelect
                name='incomeCurrency'
                id='incomeCurrency'
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={currencies}
              >
                Divisa
              </CustomSelect>
            </div>

            <CustomInput
              name='incomeNote'
              id='incomeNote'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Ej. Sueldo + freelance'
              maxLength={255}
            >
              Nota (opcional)
            </CustomInput>

            <SplitPreview amount={numeric} currency={currency} />

            <div className='flex sm:justify-end'>
              <CustomButton
                type='submit'
                isPrimary
                size='lg'
                loading={submitting}
                className='w-full sm:w-auto sm:min-w-44'
              >
                {submitting ? 'Guardando…' : existing ? 'Actualizar ingreso' : 'Guardar ingreso'}
              </CustomButton>
            </div>
          </div>
        </Card>
      </form>

      <Card title='Ingresos registrados' bodyClassName='px-2 pb-2 pt-1 sm:px-3 sm:pb-3'>
        {incomes.length === 0 ? (
          <EmptyState title='Sin ingresos'>
            {incomesLoading ? 'Cargando…' : 'Registra tu primer ingreso para calcular tu presupuesto.'}
          </EmptyState>
        ) : (
          <ul className='divide-y divide-line'>
            {incomes.map((inc) => {
              const key = incomeMonth(inc);
              const split = splitIncome(inc.amount);
              const fmt = (v) => formatCurrency(v, inc.currency_code);
              return (
                <li key={key} className='flex flex-col gap-2 px-2 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium capitalize text-ink'>{monthLabel(key)}</p>
                    <p className='text-xs text-muted'>
                      Ganado en {monthLabel(shiftMonth(key, -1))}
                      {inc.description ? ` · ${inc.description}` : ''}
                    </p>
                    <p className='mt-1 text-xs text-ink-2 tabular-nums'>
                      Invertir {fmt(split.invest)} · Ahorrar {fmt(split.save)} · Gastos {fmt(split.spending)}
                    </p>
                  </div>
                  <div className='flex items-center justify-between gap-2 sm:justify-end'>
                    <span className='text-sm font-semibold tabular-nums text-ink'>{fmt(inc.amount)}</span>
                    {confirmDelete === key ? (
                      <span className='flex items-center gap-1'>
                        <CustomButton variant='danger' size='sm' onClick={() => handleDelete(inc)}>
                          Eliminar
                        </CustomButton>
                        <CustomButton variant='ghost' size='sm' onClick={() => setConfirmDelete(null)}>
                          Cancelar
                        </CustomButton>
                      </span>
                    ) : (
                      <span className='flex items-center'>
                        <button
                          type='button'
                          onClick={() => handleEdit(inc)}
                          aria-label={`Editar ingreso de ${monthLabel(key)}`}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink'
                        >
                          <LuPencil aria-hidden />
                        </button>
                        <button
                          type='button'
                          onClick={() => setConfirmDelete(key)}
                          aria-label={`Eliminar ingreso de ${monthLabel(key)}`}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-bad-soft hover:text-bad'
                        >
                          <LuTrash2 aria-hidden />
                        </button>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
