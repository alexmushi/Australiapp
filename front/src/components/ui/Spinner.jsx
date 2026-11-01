import PropTypes from 'prop-types';

const SIZES = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' };

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full border-current border-t-transparent opacity-80 animate-[spin_0.8s_linear_infinite] ${SIZES[size]} ${className}`}
    />
  );
}

Spinner.propTypes = { size: PropTypes.oneOf(['sm', 'md', 'lg']), className: PropTypes.string };
