import PropTypes from 'prop-types';

/**
 * Material 3 button component using Material Web 1.0.
 */
export default function CustomButton({
  type = 'button',
  isPrimary = false,
  disabled = false,
  onClick,
  children,
}) {
  const Tag = isPrimary ? 'md-filled-button' : 'md-outlined-button';
  return (
    <Tag
      type={type}
      disabled={disabled}
      onClick={onClick}
      className='w-full mb-4'
    >
      {children}
    </Tag>
  );
}

CustomButton.propTypes = {
  type: PropTypes.string,
  isPrimary: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};