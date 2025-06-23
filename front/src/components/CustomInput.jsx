import { useState } from 'react';
import '@material/web/textfield/outlined-text-field.js';

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
  icon = null,
  children,
}) {
  const [showPassword] = useState(false);

  return (
    <md-outlined-text-field
      label={children}
      name={name}
      id={id}
      type={type === 'password' && showPassword ? 'text' : type}
      placeholder={placeholder}
      maxlength={maxLength}
      required={required}
      value={value}
      inputmode={inputMode}
      pattern={pattern}
      class='w-full mb-4'
      onInput={onChange}
    >
      {icon && <span slot='leading-icon'>{icon}</span>}
    </md-outlined-text-field>
  );
}