import PropTypes from 'prop-types';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';

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
    <md-outlined-select
      name={name}
      id={id}
      value={value}
      required={required}
      class='w-full mb-4'
      onInput={onChange}
    >
      <span slot='label'>{children}</span>
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