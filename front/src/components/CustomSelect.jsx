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
      <label htmlFor={id} className='block text-sm font-medium text-white-700'>
        {children}
      </label>
      <div className='relative'>
        {icon && (
          <span className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-500'>
            {icon}
          </span>
        )}
        <select
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className={`mt-1 block w-full p-2 border-b-2 ${icon ? 'pl-8' : ''} border-gray-300 focus:border-[#2196f3] focus:ring-[#2196f3] bg-transparent text-white`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className='text-black'>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

CustomSelect.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  icon: PropTypes.node,
  children: PropTypes.node,
};