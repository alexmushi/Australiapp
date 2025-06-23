import { useState } from 'react';

/**
 * Componente de entrada personalizado.
 *
 * @param {*} param0
 * @param {string} param0.name
 * @param {string} param0.id - Identifier for the input.
 * @param {string} [param0.type='text']
 * @param {string} [param0.placeholder]
 * @param {number} [param0.maxLength=100]
 * @param {Function} param0.onChange
 * @param {boolean} [param0.required=false]
 * @param {string} [param0.inputMode]
 * @param {string} [param0.pattern]
 * @param {string} [param0.value]
 * @param {string} [param0.errorMessage]
 * @param {React.ReactNode} param0.children
 */
export default function CustomInput({
  name,
  id,
  type = 'text',
  placeholder,
  maxLength = 100,
  onChange,
  required = false,
  inputMode,
  pattern,
  value,
  errorMessage,
  icon = null,
  children,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='my-4'>
      <md-outlined-text-field
        label={children}
        name={name}
        id={id}
        type={type === 'password' && showPassword ? 'text' : type}
        placeholder={placeholder}
        maxlength={maxLength}
        required={required}
        oninput={onChange}
        value={value}
        inputmode={inputMode}
        pattern={pattern}
        class='w-full'
      >
        {icon && <span slot='leading-icon'>{icon}</span>}
        {type === 'password' && (
          <md-icon-button
            slot='trailing-icon'
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? 'visibility_off' : 'visibility'}
          </md-icon-button>
        )}
      </md-outlined-text-field>
      {errorMessage && <p className='mt-1 text-sm text-red-600'>{errorMessage}</p>}
    </div>
  );
}