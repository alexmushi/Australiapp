import PropTypes from 'prop-types';

/** Grupo de opciones excluyentes (radio) con aspecto de pestañas. */
export default function SegmentedControl({ name, label, value, onChange, options, className = '' }) {
  return (
    <div
      role='radiogroup'
      aria-label={label}
      className={`inline-flex rounded-lg bg-surface-2 p-1 ${className}`}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <label
            key={o.value}
            className={`relative flex-1 cursor-pointer rounded-md px-3 py-1.5 text-center text-sm font-medium whitespace-nowrap transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40 ${
              selected ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'
            }`}
          >
            <input
              type='radio'
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className='sr-only'
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

SegmentedControl.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.node }))
    .isRequired,
  className: PropTypes.string,
};
