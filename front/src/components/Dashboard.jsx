import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { LuChevronLeft, LuChevronRight, LuRefreshCw } from 'react-icons/lu';
import useReport from '../hooks/useReport.js';
import useCategories from '../hooks/useCategories.js';
import useSummaryTable from '../hooks/useSummaryTable.js';
import { useAuth } from '../context/AuthContext.jsx';
import { currentMonthISO, monthLabel } from '../utils/date.js';
import {
  buildCategoryView,
  buildSummaryView,
  categoryColorMap,
  spendingSegments,
} from '../utils/dashboard.js';
import SegmentedControl from './ui/SegmentedControl.jsx';
import Alert from './ui/Alert.jsx';
import CustomButton from './CustomButton.jsx';
import CategoryFilter from './dashboard/CategoryFilter.jsx';
import BudgetOverview from './dashboard/BudgetOverview.jsx';
import CategoryBreakdown from './dashboard/CategoryBreakdown.jsx';
import SpendingChart from './dashboard/SpendingChart.jsx';
import ExpenseList from './dashboard/ExpenseList.jsx';
import HistoryTable from './dashboard/HistoryTable.jsx';

const ranges = [
  { value: 'month', label: 'Este mes' },
  // { value: 'week', label: 'Esta semana' }, Desactivado hasta corregirlo
  { value: 'year', label: 'Último año' },
  { value: 'all', label: 'Todo' },
  { value: 'custom', label: 'Elegir mes' },
];

const LOCAL_KEY = 'dashboard_selected_categories';

function readStoredSelection() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY));
    if (Array.isArray(parsed) && parsed.length) return parsed.map(String);
  } catch (e) {
    console.error('Failed to parse stored categories', e);
  }
  return ['all'];
}

function shiftMonth(monthISO, delta) {
  const [y, m] = monthISO.split('-').map(Number);
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

function MonthStepper({ value, onChange }) {
  return (
    <div className='flex h-10 items-center rounded-lg border border-line-strong bg-surface'>
      <button
        type='button'
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label='Mes anterior'
        className='flex h-full w-10 items-center justify-center rounded-l-lg text-ink-2 hover:bg-surface-2'
      >
        <LuChevronLeft aria-hidden />
      </button>
      <span className='min-w-36 flex-1 px-2 text-center text-sm font-medium capitalize text-ink' aria-live='polite'>
        {monthLabel(value)}
      </span>
      <button
        type='button'
        onClick={() => onChange(shiftMonth(value, 1))}
        aria-label='Mes siguiente'
        className='flex h-full w-10 items-center justify-center rounded-r-lg text-ink-2 hover:bg-surface-2'
      >
        <LuChevronRight aria-hidden />
      </button>
    </div>
  );
}

MonthStepper.propTypes = { value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired };

function Skeleton() {
  const block = 'animate-pulse rounded-xl border border-line bg-surface';
  return (
    <div className='flex flex-col gap-5' aria-busy='true' aria-label='Cargando resumen'>
      <div className={`${block} h-56`} />
      <div className='grid gap-5 lg:grid-cols-5'>
        <div className={`${block} h-72 lg:col-span-3`} />
        <div className={`${block} h-72 lg:col-span-2`} />
      </div>
      <p className='sr-only'>Cargando...</p>
    </div>
  );
}

export default function Dashboard({ onAddExpense }) {
  const { user } = useAuth();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [range, setRange] = useState('month');
  const [month, setMonth] = useState(() => currentMonthISO());
  const currency = user?.default_currency_code || 'MXN';

  const [storedSelection, setSelectedCategories] = useState(readStoredSelection);

  // Descarta categorías guardadas que ya no existen (de forma síncrona, para no
  // pedir nunca el reporte de una categoría borrada).
  const selectedCategories = useMemo(() => {
    if (categoriesLoading || categoriesError || storedSelection.includes('all')) return storedSelection;
    const known = new Set(categories.map((c) => String(c.id)));
    const valid = storedSelection.filter((id) => known.has(id));
    if (valid.length === storedSelection.length) return storedSelection;
    return valid.length ? valid : ['all'];
  }, [categories, categoriesLoading, categoriesError, storedSelection]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(selectedCategories));
    } catch {
      // almacenamiento no disponible
    }
  }, [selectedCategories]);

  const isAll = selectedCategories.length === 1 && selectedCategories[0] === 'all';
  const isSingle = selectedCategories.length === 1 && !isAll;
  const categoryParam = isSingle ? selectedCategories[0] : 'all';

  // Con un filtro guardado, espera a conocer las categorías para no pedir una que ya no existe.
  const report = useReport(range, categoryParam, currency, range === 'custom' ? month : undefined, {
    enabled: isAll || !categoriesLoading,
  });
  const table = useSummaryTable(isAll, currency);
  const colorMap = useMemo(() => categoryColorMap(categories), [categories]);

  const view = useMemo(() => {
    const data = report.data;
    if (!data) return null;
    if (isSingle) {
      if (!data.expenses || !Array.isArray(data.expenses.items)) return null;
      return buildCategoryView(data);
    }
    if (!Array.isArray(data.categories) || !Array.isArray(data.expenses)) return null;
    return buildSummaryView(data, selectedCategories);
  }, [report.data, isSingle, selectedCategories]);

  const periodLabel =
    range === 'month'
      ? `Este mes · ${monthLabel(currentMonthISO())}`
      : range === 'year'
        ? 'Últimos 12 meses'
        : range === 'all'
          ? 'Todo el historial'
          : monthLabel(month);

  const overviewTitle = isSingle
    ? view?.categories[0]?.name ?? 'Categoría'
    : isAll
      ? 'Todas las categorías'
      : `${selectedCategories.length} categorías`;

  let body;
  if (report.error) {
    body = (
      <Alert
        title='No se pudo cargar el resumen'
        action={
          <CustomButton variant='secondary' size='sm' onClick={report.reload}>
            <LuRefreshCw aria-hidden />
            Reintentar
          </CustomButton>
        }
      >
        Revisa tu conexión e inténtalo de nuevo.
      </Alert>
    );
  } else if (!view) {
    body = <Skeleton />;
  } else {
    const segments = spendingSegments(view.categories, colorMap);
    body = (
      <div className='flex flex-col gap-5'>
        <BudgetOverview title={overviewTitle} periodLabel={periodLabel} view={view} currency={currency} />
        <div className='grid items-start gap-5 lg:grid-cols-5'>
          <div className='flex flex-col gap-5 lg:col-span-3'>
            {!isSingle && (
              <CategoryBreakdown
                categories={view.categories}
                colorMap={colorMap}
                currency={currency}
                onSelect={(id) => setSelectedCategories([id])}
              />
            )}
            <ExpenseList
              expenses={view.expenses}
              colorMap={colorMap}
              currency={currency}
              onAddExpense={onAddExpense}
            />
          </div>
          {!isSingle && (
            <div className='lg:col-span-2 lg:sticky lg:top-24'>
              <SpendingChart segments={segments} total={view.spent} currency={currency} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
        <div className='-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0'>
          <SegmentedControl
            name='range'
            label='Periodo'
            value={range}
            onChange={setRange}
            options={ranges}
            className='min-w-full sm:min-w-0'
          />
        </div>
        {range === 'custom' && <MonthStepper value={month} onChange={setMonth} />}
        <div className='sm:ml-auto'>
          <CategoryFilter
            categories={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
            colorMap={colorMap}
          />
        </div>
      </div>

      {body}

      {isAll && table.error && (
        <Alert
          title='No se pudo cargar el histórico'
          action={
            <CustomButton variant='secondary' size='sm' onClick={table.reload}>
              Reintentar
            </CustomButton>
          }
        />
      )}
      {isAll && table.data && <HistoryTable table={table.data} currency={currency} />}
    </div>
  );
}

Dashboard.propTypes = { onAddExpense: PropTypes.func };
