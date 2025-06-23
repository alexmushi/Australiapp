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
        label={children}
        name={name}
        id={id}
        value={value}
        oninput={onChange}
        required={required}
        class='w-full'
      >
        {icon && <span slot='leading-icon'>{icon}</span>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <md-select-option key={val} value={val}>
              {label}
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