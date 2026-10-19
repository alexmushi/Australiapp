import PropTypes from 'prop-types';

/** Interruptor accesible (checkbox con rol switch). */
export default function Switch({ id, checked, onChange, label, description, disabled }) {
  return (
    <label
      htmlFor={id}
      className='flex cursor-pointer items-start justify-between gap-4 rounded-lg py-2'
    >
      <span className='flex flex-col'>
        <span className='text-sm font-medium text-ink'>{label}</span>
        {description && <span className='text-xs text-muted'>{description}</span>}
      </span>
      <span className='relative mt-0.5 inline-flex shrink-0'>
        <input
          id={id}
          type='checkbox'
          role='switch'
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className='peer sr-only'
        />
        <span className='h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface peer-disabled:opacity-50' />
        <span className='pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5' />
      </span>
    </label>
  );
}

Switch.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.node.isRequired,
  description: PropTypes.node,
  disabled: PropTypes.bool,
};
