import PropTypes from 'prop-types';

/** Envoltorio común: etiqueta, ayuda y mensaje de error ligados al control. */
export default function Field({ id, label, hint, error, className = '', children }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className='text-sm font-medium text-ink-2'>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className='text-xs font-medium text-bad'>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className='text-xs text-muted'>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

Field.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.node,
  hint: PropTypes.node,
  error: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
};
