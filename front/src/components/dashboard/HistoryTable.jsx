import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card.jsx';
import { computeHistoryTotals } from '../../utils/dashboard.js';
import { monthShort } from '../../utils/date.js';
import { formatAmount } from '../../utils/money.js';
import { PLAN_LABELS } from '../../utils/plan.js';

/**
 * Tabla histórica: por mes, el ingreso y su reparto, el gasto por categoría y
 * la diferencia contra el 50% para gastos. Columna fija y resaltado en cruz.
 */
export default function HistoryTable({ table, currency }) {
  const [hoverCol, setHoverCol] = useState(null);
  const scrollRef = useRef(null);
  const { diffs, acumulados, totals } = computeHistoryTotals(table);
  const colCount = table.months.length + 1; // meses + Total

  // Muestra primero los meses más recientes (a la derecha).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [table]);

  const missing = table.plan.map((p) => Boolean(p.missing));

  const cellClass = (col, extra = '') =>
    `px-3 py-2 text-right tabular-nums whitespace-nowrap ${col === colCount ? 'group-start font-semibold' : ''} ${
      hoverCol === col ? 'col-hover' : ''
    } ${extra}`;

  const toneOf = (v) => (v <= -0.005 ? 'text-bad' : v >= 0.005 ? 'text-good' : '');

  /** Una fila: etiqueta fija + un valor por mes + total. */
  const row = (key, label, values, total, { bold = false, tone = false, planRow = false } = {}) => (
    <tr key={key} className={bold ? 'bg-surface-2/60 font-semibold' : ''}>
      <th
        scope='row'
        className={`sticky-col px-3 py-2 text-left whitespace-nowrap ${bold ? 'font-semibold' : 'font-medium'}`}
        onMouseEnter={() => setHoverCol(0)}
      >
        {label}
      </th>
      {values.map((v, i) => {
        const col = i + 1;
        const empty = planRow && missing[i];
        return (
          <td
            key={col}
            className={cellClass(col, empty ? 'text-muted' : tone ? toneOf(v) : '')}
            onMouseEnter={() => setHoverCol(col)}
          >
            {empty ? '—' : formatAmount(v)}
          </td>
        );
      })}
      <td
        className={cellClass(colCount, total != null && tone ? toneOf(total) : '')}
        onMouseEnter={() => setHoverCol(colCount)}
      >
        {total == null ? '' : formatAmount(total)}
      </td>
    </tr>
  );

  const section = (key, label) => (
    <tr key={key}>
      <th
        scope='colgroup'
        colSpan={colCount + 1}
        className='bg-surface px-3 pt-4 pb-1 text-left text-xs font-semibold tracking-wide text-muted uppercase'
      >
        <span className='sticky left-3'>{label}</span>
      </th>
    </tr>
  );

  return (
    <Card
      title='Histórico mensual'
      subtitle={`Ingreso, reparto y gasto por mes · montos en ${currency}`}
      bodyClassName='p-0 sm:p-0'
    >
      <div ref={scrollRef} className='overflow-x-auto overscroll-x-contain border-t border-line'>
        <table className='crosshair-table w-full min-w-max border-collapse text-sm' onMouseLeave={() => setHoverCol(null)}>
          <thead className='bg-surface-2 text-xs text-muted'>
            <tr>
              <th scope='col' className='sticky-col px-3 py-2 text-left font-semibold text-ink-2'>
                Concepto
              </th>
              {table.months.map((m, i) => (
                <th
                  key={`${m.year}-${m.month}`}
                  scope='col'
                  className={cellClass(i + 1, 'font-semibold text-ink-2')}
                  onMouseEnter={() => setHoverCol(i + 1)}
                >
                  {monthShort(m.month)} {m.year}
                </th>
              ))}
              <th scope='col' className={cellClass(colCount, 'text-ink-2')} onMouseEnter={() => setHoverCol(colCount)}>
                Total
              </th>
            </tr>
          </thead>
          <tbody className='text-ink'>
            {section('s-plan', 'Reparto del ingreso')}
            {row('income', 'Ingreso', table.plan.map((p) => p.income), totals.income, { planRow: true })}
            {row('invest', `${PLAN_LABELS.invest} (30%)`, table.plan.map((p) => p.invest), totals.invest, { planRow: true })}
            {row('save', `${PLAN_LABELS.save} (20%)`, table.plan.map((p) => p.save), totals.save, { planRow: true })}
            {row('spending', `${PLAN_LABELS.spending} (50%)`, table.plan.map((p) => p.spending), totals.spending, {
              planRow: true,
              bold: true,
            })}
            {section('s-cats', 'Gastos por categoría')}
            {table.categories.map((c) => row(`cat-${c.id}`, c.name, c.months, c.total))}
            {row('spent', 'Total gastado', table.spent, totals.spent, { bold: true })}
            {section('s-result', 'Resultado')}
            {row('diff', 'Diferencia', diffs, totals.diff, { tone: true })}
            {row('acum', 'Acumulado', acumulados, null, { tone: true, bold: true })}
          </tbody>
        </table>
      </div>
      <p className='border-t border-line px-4 py-3 text-xs text-muted sm:px-5'>
        Diferencia = dinero para gastos (50%) − total gastado. Positivo significa que te sobró.
      </p>
    </Card>
  );
}

HistoryTable.propTypes = {
  table: PropTypes.shape({
    months: PropTypes.arrayOf(PropTypes.shape({ year: PropTypes.number, month: PropTypes.number })).isRequired,
    plan: PropTypes.arrayOf(
      PropTypes.shape({
        income: PropTypes.number,
        invest: PropTypes.number,
        save: PropTypes.number,
        spending: PropTypes.number,
        missing: PropTypes.bool,
      })
    ).isRequired,
    spent: PropTypes.arrayOf(PropTypes.number).isRequired,
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
        months: PropTypes.arrayOf(PropTypes.number),
        total: PropTypes.number,
      })
    ).isRequired,
  }).isRequired,
  currency: PropTypes.string.isRequired,
};
