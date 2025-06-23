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
  const ButtonTag = isPrimary ? 'md-filled-button' : 'md-outlined-button';
  return (
    <ButtonTag type={type} disabled={disabled} onClick={onClick} className='w-full mb-4'>
      {children}
    </ButtonTag>
  );
}

CustomButton.propTypes = {
  type: PropTypes.string,
  isPrimary: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};