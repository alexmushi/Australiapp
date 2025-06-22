import PropTypes from 'prop-types';

/**
 * Componente de botón personalizado.
 */
export default function CustomButton({
  type = 'button',
  isPrimary = false,
  disabled = false,
  onClick,
  children,
}) {
  const primaryClasses =
    'w-full bg-[#2196f3] text-white py-2 px-4 mb-4 rounded-md hover:bg-[#1976d2] transition duration-200 cursor-pointer';
  const secondaryClasses =
    'w-full bg-[#1e1e1e] text-gray-200 py-2 px-4 mb-4 rounded-md border border-gray-600 hover:bg-[#2c2c2c] transition duration-200 cursor-pointer';
  const disabledClasses =
    'w-full bg-gray-500 text-white py-2 px-4 mb-4 rounded-md cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      className={disabled ? disabledClasses : isPrimary ? primaryClasses : secondaryClasses}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

CustomButton.propTypes = {
  type: PropTypes.string,
  isPrimary: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};