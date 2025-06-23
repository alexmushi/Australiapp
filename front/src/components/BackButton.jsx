import React from 'react';

/**
 * Simple back button with an arrow icon.
 * @param {{onClick: function, className?: string}} props
 */
export default function BackButton({ onClick, className = '' }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex items-center text-[#2196f3] hover:underline ${className}`}
    >
      <span className='mr-1'>&larr;</span>
      Regresar
    </button>
  );
}