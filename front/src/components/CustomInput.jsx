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
      <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
        <div className='flex justify-between items-center w-full'>
          <span>{children}</span>
          {type === 'password' && (
            <button
              type='button'
              onClick={() => setShowPassword((p) => !p)}
              className='text-sm text-[#D07024] hover:underline ml-2'
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          )}
        </div>
      </label>
      <div className='relative'>
        {icon && (
          <span className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-400'>
            {icon}
          </span>
        )}
        <input
          name={name}
          id={id}
          type={type === 'password' && showPassword ? 'text' : type}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          onChange={onChange}
          value={value}
          inputMode={inputMode}
          pattern={pattern}
          className={`mt-1 block w-full p-2 border-b-2 ${
            icon ? 'pl-8' : ''
          } ${
            errorMessage ? 'border-red-500' : 'border-gray-300'
          } focus:border-[#D07024] focus:ring-[#D07024] placeholder:text-gray-400 placeholder:text-sm`}
        />
      </div>
      {errorMessage && <p className='mt-1 text-sm text-red-600'>{errorMessage}</p>}
    </div>
  );
}