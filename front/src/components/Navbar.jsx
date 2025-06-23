import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/button/text-button.js';
import useCurrencies from '../hooks/useCurrencies.js';

export default function Navbar({ onNavigate, onLogout, currency, onCurrencyChange }) {
  const [open, setOpen] = useState(false);
  const currencies = useCurrencies();
  return (
    <nav className='bg-surface text-gray-200 p-4 flex items-center gap-4'>
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
        <md-icon-button onClick={() => setOpen(!open)}>
          <md-icon>account_circle</md-icon>
        </md-icon-button>
        {open && (
          <div className='absolute right-0 mt-2 w-40 bg-surface text-white rounded shadow-md p-2'>
            <md-outlined-select
              className='w-full mb-2'
              value={currency}
              oninput={(e) => onCurrencyChange(e.target.value)}
            >
              {currencies.map((code) => (
                <md-select-option key={code} value={code}>
                  {code}
                </md-select-option>
              ))}
            </md-outlined-select>
            <md-text-button className='w-full text-left' onClick={onLogout}>
              Cerrar sesión
            </md-text-button>
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