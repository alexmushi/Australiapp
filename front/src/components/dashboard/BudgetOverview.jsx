import PropTypes from 'prop-types';
import { LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';
import BudgetBar from './BudgetBar.jsx';
import { formatCurrency } from '../../utils/money.js';

function Stat({ label, value, tone }) {
  return (
    <div className='min-w-0'>
      <p className='text-xs font-medium text-muted'>{label}</p>
      <p className={`mt-0.5 truncate text-base font-semibold tabular-nums sm:text-lg ${tone ?? 'text-ink'}`}>
        {value}
      </p>
    </div>
  );
}

Stat.propTypes = { label: PropTypes.node, value: PropTypes.node, tone: PropTypes.string };

export default function BudgetOverview({ title, periodLabel, view, currency }) {
  const fmt = (v) => formatCurrency(v, currency);
  const { budget, spent, percentage, remaining, over, isOver } = view;
  return (
    <section
      aria-label='Resumen del presupuesto'
      className='rounded-xl border border-line bg-surface p-4 shadow-card sm:p-6'
    >
      <div className='flex flex-wrap items-start justify-between gap-2'>
        <div>
          <p className='text-sm font-medium text-ink-2'>{title}</p>
          <p className='text-xs text-muted'>{periodLabel}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isOver ? 'bg-bad-soft text-bad' : 'bg-good-soft text-good'
          }`}
        >
          {isOver ? <LuTriangleAlert aria-hidden /> : <LuCircleCheck aria-hidden />}
          {isOver ? 'Presupuesto excedido' : 'Dentro del presupuesto'}
        </span>
      </div>

      <div className='mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1'>
        <span className='text-3xl font-semibold tracking-tight text-ink sm:text-4xl' data-testid='total-spent'>
          {fmt(spent)}
        </span>
        <span className='text-sm text-muted'>gastado de {fmt(budget)}</span>
      </div>

      <div className='mt-4'>
        <BudgetBar percentage={percentage} isOver={isOver} size='lg' label='Presupuesto usado' />
        <div className='mt-2 flex justify-between text-xs font-medium'>
          <span className={isOver ? 'text-bad' : 'text-ink-2'}>{percentage.toFixed(0)}% usado</span>
          <span className={isOver ? 'text-bad' : 'text-ink-2'}>
            {isOver ? `${fmt(over)} sobre` : `${fmt(remaining)} restante`}
          </span>
        </div>
      </div>

      <div className='mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4'>
        <Stat label='Presupuesto' value={fmt(budget)} />
        <Stat label='Gastado' value={fmt(spent)} />
        <Stat
          label={isOver ? 'Excedido' : 'Disponible'}
          value={fmt(isOver ? over : remaining)}
          tone={isOver ? 'text-bad' : 'text-good'}
        />
      </div>
    </section>
  );
}

BudgetOverview.propTypes = {
  title: PropTypes.node.isRequired,
  periodLabel: PropTypes.node,
  view: PropTypes.shape({
    budget: PropTypes.number,
    spent: PropTypes.number,
    percentage: PropTypes.number,
    remaining: PropTypes.number,
    over: PropTypes.number,
    isOver: PropTypes.bool,
  }).isRequired,
  currency: PropTypes.string.isRequired,
};
