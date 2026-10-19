import PropTypes from 'prop-types';
import { LuCircleCheck, LuTriangleAlert, LuInfo } from 'react-icons/lu';
import useApi from '../hooks/useApi.js';
import useRates, { convertWithRates } from '../hooks/useRates.js';
import { fetchMonthStatus } from '../services/api.js';
import { monthLabel, shiftMonth, toMonthISO } from '../utils/date.js';
import { formatCurrency } from '../utils/money.js';

function Line({ tone, icon: Icon, children }) {
  const cls = { good: 'bg-good-soft text-good', warn: 'bg-warn-soft text-warn', bad: 'bg-bad-soft text-bad', info: 'bg-surface-2 text-ink-2' }[tone];
  return (
    <div role='status' className={`flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm ${cls}`}>
      <Icon aria-hidden className='mt-0.5 shrink-0' />
      <div className='min-w-0'>{children}</div>
    </div>
  );
}

Line.propTypes = { tone: PropTypes.string.isRequired, icon: PropTypes.elementType.isRequired, children: PropTypes.node };

/**
 * Cuánto queda del 50% en el mes del gasto, cómo queda después de registrarlo
 * y un aviso si los dos meses anteriores se excedió.
 */
export default function ExpenseBudgetHint({ month, amount, currency, displayCurrency, categoryId, categoryName, refreshKey }) {
  const { data: status } = useApi(() => fetchMonthStatus(month, displayCurrency), [month, displayCurrency, refreshKey]);
  const rates = useRates();
  if (!status) return null;

  const fmt = (v) => formatCurrency(v, displayCurrency);
  const label = monthLabel(month);
  const amountDisplay =
    Number.isFinite(amount) && amount > 0 && currency ? convertWithRates(amount, currency, displayCurrency, rates) : null;
  const after = amountDisplay != null ? status.remaining - amountDisplay : null;

  const streakSpent = status.overspentStreak
    ? status.previous.reduce((s, p) => s + (p.byCategory?.[categoryId] ?? 0), 0)
    : 0;
  const prevLabels = status.previous.map((p) => monthLabel(toMonthISO(p)));

  return (
    <div className='flex flex-col gap-2' data-testid='budget-hint'>
      {status.overspentStreak && (
        <Line tone='bad' icon={LuTriangleAlert}>
          <p className='font-semibold'>Llevas dos meses seguidos pasándote del 50%</p>
          <p className='opacity-90'>
            En {prevLabels.join(' y ')} gastaste más de lo disponible.
            {categoryName && streakSpent > 0 && ` En esos meses ${categoryName} sumó ${fmt(streakSpent)}.`}
          </p>
        </Line>
      )}
      {!status.hasIncome ? (
        <Line tone='info' icon={LuInfo}>
          Aún no registras el ingreso de {label} (lo ganado en {monthLabel(shiftMonth(month, -1))}), así que no
          hay dinero para gastos calculado.
        </Line>
      ) : (
        <Line
          tone={after != null ? (after < 0 ? 'bad' : 'good') : status.remaining < 0 ? 'bad' : 'good'}
          icon={(after ?? status.remaining) < 0 ? LuTriangleAlert : LuCircleCheck}
        >
          <p>
            {status.remaining >= 0 ? (
              <>
                Te quedan <strong className='tabular-nums'>{fmt(status.remaining)}</strong> para gastar en {label}.
              </>
            ) : (
              <>
                Ya te pasaste por <strong className='tabular-nums'>{fmt(-status.remaining)}</strong> en {label}.
              </>
            )}
          </p>
          {after != null && (
            <p className='opacity-90' data-testid='after-expense'>
              {after >= 0
                ? `Después de este gasto: ${fmt(after)}.`
                : `Con este gasto quedarías ${fmt(-after)} por encima del 50%.`}
            </p>
          )}
        </Line>
      )}
    </div>
  );
}

ExpenseBudgetHint.propTypes = {
  month: PropTypes.string.isRequired,
  amount: PropTypes.number,
  currency: PropTypes.string,
  displayCurrency: PropTypes.string.isRequired,
  categoryId: PropTypes.string,
  categoryName: PropTypes.string,
  refreshKey: PropTypes.number,
};
