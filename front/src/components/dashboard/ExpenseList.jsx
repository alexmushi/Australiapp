import { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import CustomButton from '../CustomButton.jsx';
import { formatDate } from '../../utils/date.js';
import { formatCurrency } from '../../utils/money.js';
import { sortExpensesByDateDesc } from '../../utils/dashboard.js';

const PAGE = 8;

export default function ExpenseList({ expenses, colorMap, currency, onAddExpense }) {
  const [showAll, setShowAll] = useState(false);
  const sorted = sortExpensesByDateDesc(expenses);
  const visible = showAll ? sorted : sorted.slice(0, PAGE);

  return (
    <Card
      title='Movimientos'
      subtitle={`${expenses.length} ${expenses.length === 1 ? 'gasto' : 'gastos'} en el periodo`}
      bodyClassName='px-2 pb-2 pt-1 sm:px-3 sm:pb-3'
    >
      {sorted.length === 0 ? (
        <EmptyState
          title='Sin movimientos'
          action={
            onAddExpense && (
              <CustomButton isPrimary size='sm' onClick={onAddExpense}>
                Registrar gasto
              </CustomButton>
            )
          }
        >
          No hay gastos registrados en este periodo.
        </EmptyState>
      ) : (
        <>
          <ul className='divide-y divide-line'>
            {visible.map((e) => (
              <li key={e.id ?? `${e.date}-${e.amount}`} className='flex items-center gap-3 px-2 py-3 sm:px-3'>
                <span
                  aria-hidden
                  className='h-9 w-1 shrink-0 rounded-full'
                  style={{ background: colorMap[String(e.category_id)] ?? 'var(--series-other)' }}
                />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-ink'>
                    {e.description || <span className='text-muted'>Sin descripción</span>}
                  </p>
                  <p className='flex items-center gap-1.5 truncate text-xs text-muted'>
                    <span>{formatDate(e.date)}</span>
                    <span aria-hidden>·</span>
                    <span className='truncate'>{e.categoryName}</span>
                  </p>
                </div>
                <span className='shrink-0 text-sm font-semibold tabular-nums text-ink'>
                  {formatCurrency(e.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
          {sorted.length > PAGE && (
            <div className='px-2 pt-2 sm:px-3'>
              <CustomButton variant='ghost' size='sm' fullWidth onClick={() => setShowAll((s) => !s)}>
                {showAll ? 'Mostrar menos' : `Ver los ${sorted.length} movimientos`}
              </CustomButton>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

ExpenseList.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      category_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      categoryName: PropTypes.string,
      amount: PropTypes.number.isRequired,
      date: PropTypes.string,
      description: PropTypes.string,
    })
  ).isRequired,
  colorMap: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  onAddExpense: PropTypes.func,
};
