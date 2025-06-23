import PropTypes from 'prop-types';

export default function CustomSelect({
  name,
  id,
  value,
  onChange,
  options = [],
  required = false,
  icon = null,
  children,
}) {
  return (
    <div className='my-4'>
      <md-outlined-select
        label={String(children)}
        name={name}
        id={id}
        value={value}
        onInput={onChange}
        required={required}
        className='w-full'
      >
        {icon && <span slot='leading-icon'>{icon}</span>}
        {options.map((opt) => {
          if (typeof opt === 'object') {
            return (
              <md-select-option key={opt.value} value={opt.value}>
                {opt.label}
              </md-select-option>
            );
          }
          return (
            <md-select-option key={opt} value={opt}>
              {opt}
            </md-select-option>
          );
        })}
      </md-outlined-select>
    </div>
  );
}

CustomSelect.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
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
  children: PropTypes.node,
};