import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import Card from '../ui/Card.jsx';
import useColorScheme, { resolveCssColor } from '../../hooks/useColorScheme.js';
import { formatCurrency } from '../../utils/money.js';
import { monthShort, toMonthISO } from '../../utils/date.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

/** Gasto por mes; al hacer clic en un mes se abre su detalle. */
export default function MonthlyChart({ series, title, currency, selectedMonth, onSelectMonth }) {
  const scheme = useColorScheme();
  const fmt = (v) => formatCurrency(v, currency);
  const labels = series.months.map((m) => `${monthShort(m.month)} ${String(m.year).slice(2)}`);
  const selectedIdx = series.months.findIndex((m) => toMonthISO(m) === selectedMonth);
  const spentColor = resolveCssColor('var(--series-1)');
  const dim = (c) => (selectedIdx === -1 ? c : series.months.map((_, i) => (i === selectedIdx ? c : `${c}66`)));

  const datasets = [
    {
      label: 'Gastado',
      data: series.spent,
      backgroundColor: dim(spentColor),
      borderRadius: 4,
      maxBarThickness: 28,
    },
  ];
  if (series.pool) {
    datasets.push({
      label: 'Para gastos (50%)',
      data: series.pool,
      backgroundColor: resolveCssColor('var(--app-line-strong)'),
      borderRadius: 4,
      maxBarThickness: 28,
    });
  }
  const ink2 = resolveCssColor('var(--app-muted)');
  const grid = resolveCssColor('var(--app-line)');

  const options = {
    maintainAspectRatio: false,
    onClick: (_evt, elements) => {
      if (elements.length) onSelectMonth(toMonthISO(series.months[elements[0].index]));
    },
    onHover: (evt, elements) => {
      if (evt.native?.target) evt.native.target.style.cursor = elements.length ? 'pointer' : 'default';
    },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y == null ? 'sin ingreso' : fmt(ctx.parsed.y)}`,
          footer: () => 'Clic para ver el detalle',
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: ink2 } },
      y: {
        beginAtZero: true,
        grid: { color: grid },
        border: { display: false },
        ticks: {
          color: ink2,
          maxTicksLimit: 5,
          callback: (v) => new Intl.NumberFormat('es-MX', { notation: 'compact' }).format(v),
        },
      },
    },
  };

  return (
    <Card
      title={title}
      subtitle='Toca un mes para ver su detalle'
      actions={
        <ul className='flex flex-wrap gap-3 text-xs text-ink-2' aria-label='Leyenda'>
          <li className='flex items-center gap-1.5'>
            <span aria-hidden className='h-2.5 w-2.5 rounded-sm' style={{ background: 'var(--series-1)' }} />
            Gastado
          </li>
          {series.pool && (
            <li className='flex items-center gap-1.5'>
              <span aria-hidden className='h-2.5 w-2.5 rounded-sm' style={{ background: 'var(--app-line-strong)' }} />
              Para gastos (50%)
            </li>
          )}
        </ul>
      }
    >
      <div className='h-56'>
        <Bar
          key={scheme}
          data={{ labels, datasets }}
          options={options}
          role='img'
          aria-label={`${title}: ${series.months.map((m, i) => `${labels[i]} ${fmt(series.spent[i])}`).join(', ')}`}
        />
      </div>
    </Card>
  );
}

MonthlyChart.propTypes = {
  series: PropTypes.shape({
    months: PropTypes.arrayOf(PropTypes.shape({ year: PropTypes.number, month: PropTypes.number })).isRequired,
    spent: PropTypes.arrayOf(PropTypes.number).isRequired,
    pool: PropTypes.array,
  }).isRequired,
  title: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  selectedMonth: PropTypes.string,
  onSelectMonth: PropTypes.func.isRequired,
};
