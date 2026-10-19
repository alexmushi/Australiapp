import PropTypes from 'prop-types';
import Card from '../ui/Card.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { formatCurrency } from '../../utils/money.js';

/** Gasto por categoría. Todas comparten el mismo dinero para gastos. */
export default function CategoryBreakdown({ categories, colorMap, currency, isFiltered, filteredSpent }) {
  const fmt = (v) => formatCurrency(v, currency);
  const withSpend = categories.filter((c) => c.expenses > 0);
  const max = Math.max(...withSpend.map((c) => c.expenses), 0);
  return (
    <Card
      title='Por categoría'
      subtitle={isFiltered ? `Categorías filtradas · ${fmt(filteredSpent)}` : 'En qué se fue el dinero para gastos'}
      bodyClassName='px-2 pb-2 pt-2 sm:px-3 sm:pb-3'
    >
      {withSpend.length === 0 ? (
        <EmptyState title='Sin gastos'>No hay gastos en estas categorías en el periodo.</EmptyState>
      ) : (
        <ul className='flex flex-col'>
          {withSpend.map((c) => (
            <li key={c.id} className='flex flex-col gap-2 px-2 py-3 sm:px-3'>
              <span className='flex items-center justify-between gap-3'>
                <span className='flex min-w-0 items-center gap-2'>
                  <span
                    aria-hidden
                    className='h-2.5 w-2.5 shrink-0 rounded-full'
                    style={{ background: colorMap[String(c.id)] }}
                  />
                  <span className='truncate text-sm font-medium text-ink'>{c.name}</span>
                </span>
                <span className='shrink-0 text-sm font-semibold tabular-nums text-ink'>{fmt(c.expenses)}</span>
              </span>
              <div className='h-1.5 w-full overflow-hidden rounded-full bg-track' aria-hidden>
                <div
                  className='h-full rounded-full'
                  style={{ width: `${max > 0 ? (c.expenses / max) * 100 : 0}%`, background: colorMap[String(c.id)] }}
                />
              </div>
              <span className='flex justify-between text-xs text-muted'>
                <span>{c.shareOfSpent.toFixed(0)}% de lo gastado</span>
                {c.shareOfPool > 0 && <span>{c.shareOfPool.toFixed(0)}% del dinero para gastos</span>}
              </span>
            </li>
          ))}
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
      expenses: PropTypes.number.isRequired,
      shareOfSpent: PropTypes.number.isRequired,
      shareOfPool: PropTypes.number.isRequired,
    })
  ).isRequired,
  colorMap: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  isFiltered: PropTypes.bool,
  filteredSpent: PropTypes.number,
};
