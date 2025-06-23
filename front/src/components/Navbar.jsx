import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useCurrencies from '../hooks/useCurrencies.js';

export default function Navbar({ onNavigate, onLogout, currency, onCurrencyChange }) {
  const [open, setOpen] = useState(false);
  const currencies = useCurrencies();
  return (
    <nav className='bg-[#1e1e1e] text-gray-200 p-4 flex items-center gap-4'>
      <button
        className='hover:underline'
        onClick={() => onNavigate('home')}
      >
        Inicio
      </button>
      <button
        className='hover:underline'
        onClick={() => onNavigate('reviewer')}
      >
        Revisores
      </button>
      <button
        className='hover:underline'
        onClick={() => onNavigate('category')}
      >
        Categorías
      </button>
      <div className='flex-grow'></div>
      <div className='relative'>
        <button className='hover:underline' onClick={() => setOpen(!open)}>
          Perfil
        </button>
        {open && (
          <div className='absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md p-2'>
            <select
              className='w-full mb-2 border p-1'
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
            >
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <button
              className='w-full text-left hover:underline'
              onClick={onLogout}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  onCurrencyChange: PropTypes.func.isRequired,
};