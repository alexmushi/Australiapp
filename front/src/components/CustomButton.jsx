import PropTypes from 'prop-types';
import Spinner from './ui/Spinner.jsx';

const VARIANTS = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-hover shadow-card disabled:opacity-60',
  secondary:
    'bg-surface text-ink border border-line-strong hover:bg-surface-2 disabled:opacity-60',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink disabled:opacity-50',
  danger: 'text-bad hover:bg-bad-soft disabled:opacity-50',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

/**
 * Componente de botón personalizado.
 */
export default function CustomButton({
  type = 'button',
  isPrimary = false,
  variant,
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const v = variant ?? (isPrimary ? 'primary' : 'secondary');
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors select-none disabled:cursor-not-allowed ${VARIANTS[v]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner size='sm' />}
      {children}
    </button>
  );
}

CustomButton.propTypes = {
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  isPrimary: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};
