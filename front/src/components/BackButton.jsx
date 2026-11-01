import PropTypes from 'prop-types';
import { LuArrowLeft } from 'react-icons/lu';

/**
 * Botón de regresar con flecha.
 */
export default function BackButton({ onClick, className = '' }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline ${className}`}
    >
      <LuArrowLeft aria-hidden />
      Regresar
    </button>
  );
}

BackButton.propTypes = { onClick: PropTypes.func, className: PropTypes.string };
