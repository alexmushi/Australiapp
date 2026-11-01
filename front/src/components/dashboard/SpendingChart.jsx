import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import Card from '../ui/Card.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import useColorScheme, { resolveCssColor } from '../../hooks/useColorScheme.js';
import { formatCurrency } from '../../utils/money.js';

ChartJS.register(ArcElement, Tooltip);

export default function SpendingChart({ segments, total, currency }) {
  const scheme = useColorScheme();
  const fmt = (v) => formatCurrency(v, currency);

  if (!segments.length) {
    return (
      <Card title='Distribución del gasto'>
        <EmptyState title='Sin gastos en este periodo' />
      </Card>
    );
  }

  const surface = resolveCssColor('var(--app-surface)');
  const data = {
    labels: segments.map((s) => s.label),
    datasets: [
      {
        data: segments.map((s) => s.value),
        backgroundColor: segments.map((s) => resolveCssColor(s.color)),
        borderColor: surface,
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };
  const options = {
    cutout: '68%',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${fmt(ctx.parsed)} · ${segments[ctx.dataIndex].share.toFixed(1)}%`,
        },
      },
    },
  };

  return (
    <Card title='Distribución del gasto' subtitle='Proporción por categoría'>
      <div className='flex flex-col items-center gap-6 sm:flex-row lg:flex-col'>
        <div className='relative h-44 w-44 shrink-0'>
          <Doughnut key={scheme} data={data} options={options} aria-label='Gráfica de distribución del gasto' role='img' />
          <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center'>
            <span className='text-xs text-muted'>Total</span>
            <span className='text-sm font-semibold tabular-nums text-ink'>{fmt(total)}</span>
          </div>
        </div>
        <ul className='flex w-full min-w-0 flex-col gap-2.5' aria-label='Leyenda'>
          {segments.map((s) => (
            <li key={s.key} className='flex items-center justify-between gap-3 text-sm'>
              <span className='flex min-w-0 items-center gap-2'>
                <span aria-hidden className='h-2.5 w-2.5 shrink-0 rounded-full' style={{ background: s.color }} />
                <span className='truncate text-ink-2'>{s.label}</span>
              </span>
              <span className='shrink-0 tabular-nums'>
                <span className='font-medium text-ink'>{fmt(s.value)}</span>
                <span className='ml-2 inline-block w-11 text-right text-xs text-muted'>{s.share.toFixed(0)}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

SpendingChart.propTypes = {
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      value: PropTypes.number,
      share: PropTypes.number,
      color: PropTypes.string,
    })
  ).isRequired,
  total: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
};
