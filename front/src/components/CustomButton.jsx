import PropTypes from 'prop-types';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';

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
  const Element = isPrimary ? 'md-filled-button' : 'md-outlined-button';

  return (
    <Element type={type} disabled={disabled} onClick={onClick} class="w-full mb-4">
      {children}
    </Element>
  );
}

CustomButton.propTypes = {
  type: PropTypes.string,
  isPrimary: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};