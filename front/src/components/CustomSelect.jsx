import PropTypes from 'prop-types';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/icon/icon.js';

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
        name={name}
        id={id}
        label={children}
        value={value}
        required={required}
        oninput={onChange}
      >
        {icon && <md-icon slot='leading-icon'>{icon}</md-icon>}
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