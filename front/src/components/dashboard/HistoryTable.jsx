import { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card.jsx';
import { computeHistoryTotals } from '../../utils/dashboard.js';
import { monthShort } from '../../utils/date.js';
import { formatAmount } from '../../utils/money.js';

const SUB = ['Presupuesto', 'Real', 'Dif'];

/**
 * Tabla histórica por rubro y mes, con columna fija y resaltado en cruz.
 * Cada fila es una lista de celdas en el orden: Antes (3), meses (3 c/u), Total (2).
 */
export default function HistoryTable({ table, currency }) {
  const [hoverCol, setHoverCol] = useState(null);
  const totals = computeHistoryTotals(table);
  const monthCount = table.months.length;

  const diffCell = (v) => ({ value: v, diff: true });
  const rowCells = (cat) => [
    cat.antesBudget,
    cat.antesReal,
    diffCell(cat.antesBudget - cat.antesReal),
    ...cat.months.flatMap((m) => [m.budget, m.real, diffCell(m.budget - m.real)]),
    cat.totalBudget,
    cat.totalReal,
  ];
  const mensualCells = [
    totals.antesBudget,
    totals.antesReal,
    diffCell(totals.mensualDiffs[0]),
    ...totals.monthTotals.flatMap((m, i) => [m.budget, m.real, diffCell(totals.mensualDiffs[i + 1])]),
    totals.totalBudget,
    totals.totalReal,
  ];
  const acumuladoCells = [
    null,
    null,
    diffCell(totals.acumulados[0]),
    ...totals.monthTotals.flatMap((_, i) => [null, null, diffCell(totals.acumulados[i + 1])]),
    null,
    null,
  ];

  // Primera columna de cada grupo (para la línea divisoria).
  const isGroupStart = (col) => col === 1 || (col - 1) % 3 === 0;

  const cellClass = (col, extra = '') =>
    `px-3 py-2 text-right tabular-nums whitespace-nowrap ${isGroupStart(col) ? 'group-start' : ''} ${
      hoverCol === col ? 'col-hover' : ''
    } ${extra}`;

  const renderCells = (cells, rowKey) =>
    cells.map((cell, i) => {
      const col = i + 1;
      const value = cell && typeof cell === 'object' ? cell.value : cell;
      const isDiff = cell && typeof cell === 'object' && cell.diff;
      const tone = !isDiff ? '' : value <= -0.005 ? 'text-bad' : value >= 0.005 ? 'text-good' : '';
      return (
        <td key={`${rowKey}-${col}`} className={cellClass(col, tone)} onMouseEnter={() => setHoverCol(col)}>
          {value == null ? '' : formatAmount(value)}
        </td>
      );
    });

  const stickyCell = (content, extra = '') => (
    <td className={`sticky-col px-3 py-2 text-left whitespace-nowrap ${extra}`} onMouseEnter={() => setHoverCol(0)}>
      {content}
    </td>
  );

  return (
    <Card
      title='Histórico mensual'
      subtitle={`Presupuesto vs. real por rubro · montos en ${currency}`}
      bodyClassName='p-0 sm:p-0'
    >
      <div className='overflow-x-auto overscroll-x-contain border-t border-line'>
        <table
          className='crosshair-table min-w-max border-collapse text-sm'
          onMouseLeave={() => setHoverCol(null)}
        >
          <thead className='bg-surface-2 text-xs text-muted'>
            <tr>
              <th className='sticky-col px-3 py-2 text-left font-semibold text-ink-2' rowSpan={2} scope='col'>
                Rubros
              </th>
              <th className='group-start px-3 py-2 text-center font-semibold text-ink-2' colSpan={3} scope='colgroup'>
                Antes
              </th>
              {table.months.map((m) => (
                <th
                  key={`${m.year}-${m.month}`}
                  className='group-start px-3 py-2 text-center font-semibold text-ink-2'
                  colSpan={3}
                  scope='colgroup'
                >
                  {monthShort(m.month)} {m.year}
                </th>
              ))}
              <th className='group-start px-3 py-2 text-center font-semibold text-ink-2' colSpan={2} scope='colgroup'>
                Total por rubro
              </th>
            </tr>
            <tr>
              {Array.from({ length: 3 + monthCount * 3 + 2 }, (_, i) => {
                const col = i + 1;
                const label = i >= 3 + monthCount * 3 ? SUB[i - 3 - monthCount * 3] : SUB[i % 3];
                return (
                  <th
                    key={col}
                    scope='col'
                    className={cellClass(col, 'font-medium')}
                    onMouseEnter={() => setHoverCol(col)}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className='text-ink'>
            {table.categories.map((cat) => (
              <tr key={cat.id}>
                {stickyCell(cat.name, 'font-medium')}
                {renderCells(rowCells(cat), cat.id)}
              </tr>
            ))}
            <Fragment>
              <tr className='bg-surface-2/60 font-semibold'>
                {stickyCell('Mensual', 'font-semibold')}
                {renderCells(mensualCells, 'mensual')}
              </tr>
              <tr className='bg-surface-2/60 font-semibold'>
                {stickyCell('Acumulado', 'font-semibold')}
                {renderCells(acumuladoCells, 'acumulado')}
              </tr>
            </Fragment>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

HistoryTable.propTypes = {
  table: PropTypes.shape({
    months: PropTypes.arrayOf(PropTypes.shape({ year: PropTypes.number, month: PropTypes.number })).isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  currency: PropTypes.string.isRequired,
};
