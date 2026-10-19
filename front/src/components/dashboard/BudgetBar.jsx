import PropTypes from 'prop-types';

/** Barra de progreso del presupuesto. Rojo y marcada como excedida si pasa de 100%. */
export default function BudgetBar({ percentage, isOver, size = 'md', label }) {
  const width = Math.min(Math.max(percentage, 0), 100);
  const color = isOver ? 'bg-bad' : percentage >= 85 ? 'bg-warn' : 'bg-good';
  return (
    <div
      role='progressbar'
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      aria-valuetext={`${Math.round(percentage)}%`}
      className={`w-full overflow-hidden rounded-full bg-track ${size === 'lg' ? 'h-2.5' : 'h-1.5'}`}
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

BudgetBar.propTypes = {
  percentage: PropTypes.number.isRequired,
  isOver: PropTypes.bool,
  size: PropTypes.oneOf(['md', 'lg']),
  label: PropTypes.string,
};
