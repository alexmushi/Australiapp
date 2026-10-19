import PropTypes from 'prop-types';
import Card from '../ui/Card.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import BudgetBar from './BudgetBar.jsx';
import { budgetStatus } from '../../utils/dashboard.js';
import { formatCurrency } from '../../utils/money.js';

export default function CategoryBreakdown({ categories, colorMap, currency, onSelect }) {
  const fmt = (v) => formatCurrency(v, currency);
  return (
    <Card title='Por categoría' subtitle='Gastado frente a presupuesto' bodyClassName='px-2 pb-2 pt-2 sm:px-3 sm:pb-3'>
      {categories.length === 0 ? (
        <EmptyState title='Sin categorías'>No hay categorías para los filtros elegidos.</EmptyState>
      ) : (
        <ul className='flex flex-col'>
          {categories.map((c) => {
            const s = budgetStatus(c.budget, c.expenses);
            return (
              <li key={c.id}>
                <button
                  type='button'
                  onClick={() => onSelect?.(String(c.id))}
                  className='flex w-full flex-col gap-2 rounded-lg px-2 py-3 text-left hover:bg-surface-2 sm:px-3'
                >
                  <span className='flex items-center justify-between gap-3'>
                    <span className='flex min-w-0 items-center gap-2'>
                      <span
                        aria-hidden
                        className='h-2.5 w-2.5 shrink-0 rounded-full'
                        style={{ background: colorMap[String(c.id)] }}
                      />
                      <span className='truncate text-sm font-medium text-ink'>{c.name}</span>
                    </span>
                    <span className='shrink-0 text-sm tabular-nums'>
                      <span className={`font-semibold ${s.isOver ? 'text-bad' : 'text-ink'}`}>{fmt(c.expenses)}</span>
                      <span className='text-muted'> / {fmt(c.budget)}</span>
                    </span>
                  </span>
                  <BudgetBar percentage={s.percentage} isOver={s.isOver} label={`Presupuesto usado en ${c.name}`} />
                  <span className='flex justify-between text-xs text-muted'>
                    <span>{s.percentage.toFixed(0)}%</span>
                    <span className={s.isOver ? 'font-medium text-bad' : ''}>
                      {s.isOver ? `${fmt(s.over)} sobre` : `${fmt(s.remaining)} restante`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

CategoryBreakdown.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      budget: PropTypes.number.isRequired,
      expenses: PropTypes.number.isRequired,
    })
  ).isRequired,
  colorMap: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
};
