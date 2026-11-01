import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { LuRefreshCw } from 'react-icons/lu';
import useReport from '../hooks/useReport.js';
import useCategories from '../hooks/useCategories.js';
import useSummaryTable from '../hooks/useSummaryTable.js';
import { useAuth } from '../context/AuthContext.jsx';
import { currentMonthISO, monthLabel, monthProgress } from '../utils/date.js';
import { buildSummaryView, categoryColorMap, spendingSegments } from '../utils/dashboard.js';
import SegmentedControl from './ui/SegmentedControl.jsx';
import MonthStepper from './ui/MonthStepper.jsx';
import Alert from './ui/Alert.jsx';
import CustomButton from './CustomButton.jsx';
import CategoryFilter from './dashboard/CategoryFilter.jsx';
import PlanOverview from './dashboard/PlanOverview.jsx';
import CategoryBreakdown from './dashboard/CategoryBreakdown.jsx';
import SpendingChart from './dashboard/SpendingChart.jsx';
import ExpenseList from './dashboard/ExpenseList.jsx';
import HistoryTable from './dashboard/HistoryTable.jsx';
import MonthlyChart from './dashboard/MonthlyChart.jsx';
import { monthlySeries } from '../utils/monthlySeries.js';

const ranges = [
  { value: 'month', label: 'Este mes' },
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

function Skeleton() {
  const block = 'animate-pulse rounded-xl border border-line bg-surface';
  return (
    <div className='flex flex-col gap-5' aria-busy='true' aria-label='Cargando resumen'>
      <div className={`${block} h-64`} />
      <div className='grid gap-5 lg:grid-cols-5'>
        <div className={`${block} h-72 lg:col-span-3`} />
        <div className={`${block} h-72 lg:col-span-2`} />
      </div>
      <p className='sr-only'>Cargando...</p>
    </div>
  );
}

export default function Dashboard({ onAddExpense, onAddIncome }) {
  const { user } = useAuth();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [range, setRange] = useState('month');
  const [month, setMonth] = useState(() => currentMonthISO());
  const [storedSelection, setSelectedCategories] = useState(readStoredSelection);
  const currency = user?.default_currency_code || 'MXN';

  // Descarta categorías guardadas que ya no existen.
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

  // El filtro de categorías se aplica en el cliente: el dinero para gastos es uno solo.
  const report = useReport(range, currency, range === 'custom' ? month : undefined);
  const table = useSummaryTable(currency);
  const colorMap = useMemo(() => categoryColorMap(categories), [categories]);

  const view = useMemo(() => {
    const data = report.data;
    if (!data || !data.plan || !Array.isArray(data.categories) || !Array.isArray(data.expenses)) return null;
    return buildSummaryView(data, selectedCategories);
  }, [report.data, selectedCategories]);

  const periodLabel =
    range === 'month'
      ? `Este mes · ${monthLabel(currentMonthISO())}`
      : range === 'year'
        ? 'Últimos 12 meses'
        : range === 'all'
          ? 'Todo el historial'
          : monthLabel(month);

  const isCurrentMonth = range === 'month' || (range === 'custom' && month === currentMonthISO());

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
        <PlanOverview
          view={view}
          periodLabel={periodLabel}
          currency={currency}
          singleMonth={range === 'month' || range === 'custom'}
          onAddIncome={onAddIncome}
          progress={isCurrentMonth ? monthProgress() : undefined}
        />
        <div className='grid items-start gap-5 lg:grid-cols-5'>
          <div className='flex flex-col gap-5 lg:col-span-3'>
            <CategoryBreakdown
              categories={view.categories}
              colorMap={colorMap}
              currency={currency}
              isFiltered={view.isFiltered}
              filteredSpent={view.filteredSpent}
            />
            <ExpenseList
              expenses={view.expenses}
              colorMap={colorMap}
              currency={currency}
              onAddExpense={onAddExpense}
            />
          </div>
          <div className='lg:col-span-2 lg:sticky lg:top-24'>
            <SpendingChart segments={segments} total={view.filteredSpent} currency={currency} />
          </div>
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

      {table.error && (
        <Alert
          title='No se pudo cargar el histórico'
          action={
            <CustomButton variant='secondary' size='sm' onClick={table.reload}>
              Reintentar
            </CustomButton>
          }
        />
      )}
      {table.data && table.data.months.length > 1 && (
        <MonthlyChart
          series={monthlySeries(table.data, selectedCategories)}
          title={
            selectedCategories.includes('all')
              ? 'Gasto por mes'
              : `Gasto por mes · ${
                  selectedCategories.length === 1
                    ? categories.find((c) => String(c.id) === selectedCategories[0])?.name ?? 'categoría'
                    : `${selectedCategories.length} categorías`
                }`
          }
          currency={currency}
          selectedMonth={range === 'custom' ? month : range === 'month' ? currentMonthISO() : undefined}
          onSelectMonth={(m) => {
            setRange('custom');
            setMonth(m);
            window.scrollTo?.({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
      {table.data && <HistoryTable table={table.data} currency={currency} />}
    </div>
  );
}

Dashboard.propTypes = { onAddExpense: PropTypes.func, onAddIncome: PropTypes.func };
