import PropTypes from 'prop-types';
import { LuCircleCheck, LuPiggyBank, LuTrendingUp, LuTriangleAlert, LuWallet, LuBanknote } from 'react-icons/lu';
import BudgetBar from './BudgetBar.jsx';
import CustomButton from '../CustomButton.jsx';
import { formatCurrency } from '../../utils/money.js';
import { monthLabel, shiftMonth, toMonthISO } from '../../utils/date.js';
import { PLAN_LABELS, PLAN_SPLIT } from '../../utils/plan.js';

const pct = (v) => `${Math.round(v * 100)}%`;

function Tile({ icon: Icon, label, value, accent, testId }) {
  return (
    <div className='min-w-0 rounded-lg bg-surface-2 px-3 py-2.5'>
      <p className='flex items-center gap-1.5 text-xs font-medium text-muted'>
        <Icon aria-hidden className={accent} />
        <span className='truncate'>{label}</span>
      </p>
      <p className='mt-0.5 truncate text-base font-semibold tabular-nums text-ink' data-testid={testId}>
        {value}
      </p>
    </div>
  );
}

Tile.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.node,
  value: PropTypes.node,
  accent: PropTypes.string,
  testId: PropTypes.string,
};

/**
 * Tarjeta principal: ingreso del periodo, su reparto 30/20/50 y cuánto queda
 * del 50% para gastos.
 */
export default function PlanOverview({ view, periodLabel, currency, singleMonth, onAddIncome }) {
  const fmt = (v) => formatCurrency(v, currency);
  const { plan, spent, percentage, remaining, over, isOver, missingIncome } = view;
  const hasIncome = plan.income > 0;
  const missingLabels = missingIncome.map((m) => monthLabel(toMonthISO(m)));

  if (!hasIncome) {
    const target = singleMonth ? toMonthISO(view.months[0]) : null;
    return (
      <section aria-label='Presupuesto del periodo' className='rounded-xl border border-line bg-surface p-4 shadow-card sm:p-6'>
        <p className='text-sm font-medium text-ink-2'>Presupuesto</p>
        <p className='text-xs text-muted'>{periodLabel}</p>
        <div className='mt-4 flex flex-col items-start gap-3 rounded-lg bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='font-semibold text-ink'>Aún no registras tu ingreso</p>
            <p className='mt-0.5 text-sm text-muted'>
              {target
                ? `Registra lo que ganaste en ${monthLabel(shiftMonth(target, -1))} para calcular cuánto invertir, ahorrar y gastar.`
                : 'Registra tus ingresos para calcular cuánto invertir, ahorrar y gastar.'}
            </p>
          </div>
          {onAddIncome && (
            <CustomButton isPrimary size='sm' onClick={onAddIncome}>
              Registrar ingreso
            </CustomButton>
          )}
        </div>
        <p className='mt-4 text-sm text-ink-2'>
          Gastado en el periodo:{' '}
          <span className='font-semibold tabular-nums text-ink' data-testid='total-spent'>
            {fmt(spent)}
          </span>
        </p>
      </section>
    );
  }

  return (
    <section aria-label='Presupuesto del periodo' className='rounded-xl border border-line bg-surface p-4 shadow-card sm:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-2'>
        <div>
          <p className='text-sm font-medium text-ink-2'>Disponible para gastar</p>
          <p className='text-xs text-muted'>{periodLabel}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isOver ? 'bg-bad-soft text-bad' : 'bg-good-soft text-good'
          }`}
        >
          {isOver ? <LuTriangleAlert aria-hidden /> : <LuCircleCheck aria-hidden />}
          {isOver ? 'Te pasaste del 50%' : 'Dentro del 50%'}
        </span>
      </div>

      <div className='mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1'>
        <span
          className={`text-3xl font-semibold tracking-tight sm:text-4xl ${isOver ? 'text-bad' : 'text-ink'}`}
          data-testid='remaining'
        >
          {isOver ? `-${fmt(over)}` : fmt(remaining)}
        </span>
        <span className='text-sm text-muted'>
          {isOver ? 'por encima de' : 'restante de'} {fmt(plan.spending)}
        </span>
      </div>

      <div className='mt-4'>
        <BudgetBar percentage={percentage} isOver={isOver} size='lg' label='Dinero para gastos usado' />
        <div className='mt-2 flex justify-between text-xs font-medium text-ink-2'>
          <span className={isOver ? 'text-bad' : ''}>{percentage.toFixed(0)}% usado</span>
          <span>
            <span className='tabular-nums' data-testid='total-spent'>{fmt(spent)}</span> gastado
          </span>
        </div>
      </div>

      <div className='mt-5 grid grid-cols-2 gap-2 border-t border-line pt-4 sm:grid-cols-4 sm:gap-3'>
        <Tile icon={LuBanknote} label='Ingreso' value={fmt(plan.income)} accent='text-ink-2' testId='plan-income' />
        <Tile icon={LuTrendingUp} label={`${PLAN_LABELS.invest} ${pct(PLAN_SPLIT.invest)}`} value={fmt(plan.invest)} accent='text-primary' testId='plan-invest' />
        <Tile icon={LuPiggyBank} label={`${PLAN_LABELS.save} ${pct(PLAN_SPLIT.save)}`} value={fmt(plan.save)} accent='text-good' testId='plan-save' />
        <Tile icon={LuWallet} label={`${PLAN_LABELS.spending} ${pct(PLAN_SPLIT.spending)}`} value={fmt(plan.spending)} accent='text-warn' testId='plan-spending' />
      </div>

      {missingLabels.length > 0 && (
        <p className='mt-4 flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2 text-xs text-warn' role='status'>
          <LuTriangleAlert aria-hidden className='mt-0.5 shrink-0' />
          <span>
            Sin ingreso registrado en {missingLabels.length === 1 ? '' : `${missingLabels.length} meses: `}
            {missingLabels.slice(0, 4).join(', ')}
            {missingLabels.length > 4 ? '…' : ''}. Esos meses no suman dinero para gastos.
          </span>
        </p>
      )}
    </section>
  );
}

PlanOverview.propTypes = {
  view: PropTypes.shape({
    plan: PropTypes.shape({
      income: PropTypes.number,
      invest: PropTypes.number,
      save: PropTypes.number,
      spending: PropTypes.number,
    }).isRequired,
    months: PropTypes.array.isRequired,
    missingIncome: PropTypes.array.isRequired,
    spent: PropTypes.number,
    percentage: PropTypes.number,
    remaining: PropTypes.number,
    over: PropTypes.number,
    isOver: PropTypes.bool,
  }).isRequired,
  periodLabel: PropTypes.node,
  currency: PropTypes.string.isRequired,
  singleMonth: PropTypes.bool,
  onAddIncome: PropTypes.func,
};
