import PropTypes from 'prop-types';
import { LuChevronDown } from 'react-icons/lu';
import Field from './ui/Field.jsx';
import { controlClass, describedBy } from './ui/fieldStyles.js';

export default function CustomSelect({
  name,
  id,
  value,
  onChange,
  options = [],
  required = false,
  icon = null,
  placeholder,
  hint,
  error,
  disabled,
  className = '',
  children,
}) {
  return (
    <Field id={id} label={children} hint={hint} error={error} className={className}>
      <div className='relative'>
        {icon && (
          <span className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted'>
            {icon}
          </span>
        )}
        <select
          name={name}
          id={id}
          value={value}
          required={required}
          disabled={disabled}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${controlClass(error)} appearance-none cursor-pointer ${icon ? 'pl-10' : 'pl-3'} pr-10`}
        >
          {placeholder && (
            <option value='' disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const o = typeof opt === 'object' ? opt : { value: opt, label: opt };
            return (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            );
          })}
        </select>
        <LuChevronDown
          aria-hidden
          className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted'
        />
      </div>
    </Field>
  );
}

CustomSelect.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
      }),
    ])
  ),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  icon: PropTypes.node,
  placeholder: PropTypes.string,
  hint: PropTypes.node,
  error: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};
