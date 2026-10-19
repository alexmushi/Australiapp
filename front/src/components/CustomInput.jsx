import { useState } from 'react';
import PropTypes from 'prop-types';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import Field from './ui/Field.jsx';
import { controlClass, describedBy } from './ui/fieldStyles.js';

/**
 * Componente de entrada personalizado.
 */
export default function CustomInput({
  name,
  id,
  type = 'text',
  placeholder,
  maxLength = 100,
  onChange,
  onBlur,
  required = false,
  inputMode,
  pattern,
  value,
  icon = null,
  prefix = null,
  suffix = null,
  hint,
  error,
  autoComplete,
  autoFocus,
  disabled,
  min,
  max,
  className = '',
  inputClassName = '',
  children,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const leading = icon || prefix;
  const trailing = isPassword || suffix;

  return (
    <Field id={id} label={children} hint={hint} error={error} className={className}>
      <div className='relative'>
        {leading && (
          <span className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted'>
            {leading}
          </span>
        )}
        <input
          name={name}
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          value={value}
          inputMode={inputMode}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          min={min}
          max={max}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${controlClass(error)} ${leading ? 'pl-10' : 'pl-3'} ${trailing ? 'pr-11' : 'pr-3'} ${inputClassName}`}
        />
        {isPassword ? (
          <button
            type='button'
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className='absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted hover:text-ink'
          >
            {showPassword ? <LuEyeOff /> : <LuEye />}
          </button>
        ) : (
          suffix && (
            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted'>
              {suffix}
            </span>
          )
        )}
      </div>
    </Field>
  );
}

CustomInput.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  required: PropTypes.bool,
  inputMode: PropTypes.string,
  pattern: PropTypes.string,
  value: PropTypes.string,
  icon: PropTypes.node,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  hint: PropTypes.node,
  error: PropTypes.node,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  min: PropTypes.string,
  max: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  children: PropTypes.node,
};
