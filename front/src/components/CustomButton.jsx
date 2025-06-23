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
  return isPrimary ? (
    <md-filled-button
      type={type}
      disabled={disabled}
      onClick={onClick}
      class='w-full mb-4'
    >
      {children}
    </md-filled-button>
  ) : (
    <md-outlined-button
      type={type}
      disabled={disabled}
      onClick={onClick}
      class='w-full mb-4'
    >
      {children}
    </md-outlined-button>
  );
}

CustomButton.propTypes = {
  type: PropTypes.string,
  isPrimary: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};