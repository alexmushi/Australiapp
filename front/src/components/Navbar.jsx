import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useCurrencies from '../hooks/useCurrencies.js';

export default function Navbar({ onNavigate, onLogout, currency, onCurrencyChange }) {
  const [open, setOpen] = useState(false);
  const currencies = useCurrencies();
  return (
    <>
      <md-top-app-bar>
        <md-icon-button slot='navigationIcon' onClick={() => setOpen(!open)}>
          <span className='material-symbols-outlined'>menu</span>
        </md-icon-button>
        <div slot='title'>Australiapp</div>
        <md-icon-button slot='actionItems' onClick={onLogout}>
          <span className='material-symbols-outlined'>logout</span>
        </md-icon-button>
      </md-top-app-bar>
      {open && (
        <div className='p-4'>
          <md-elevation></md-elevation>
          <md-list>
            <md-list-item onClick={() => { onNavigate('home'); setOpen(false); }}>
              Inicio
            </md-list-item>
            <md-list-item onClick={() => { onNavigate('reviewer'); setOpen(false); }}>
              Revisores
            </md-list-item>
            <md-list-item onClick={() => { onNavigate('category'); setOpen(false); }}>
              Categorías
            </md-list-item>
            <md-list-item>
              <md-outlined-select
                value={currency}
                label='Moneda'
                onInput={(e) => onCurrencyChange(e.target.value)}
                className='w-full'
              >
                {currencies.map((code) => (
                  <md-select-option key={code} value={code}>
                    {code}
                  </md-select-option>
                ))}
              </md-outlined-select>
            </md-list-item>
          </md-list>
        </div>
      )}
    </>
  );
}

Navbar.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  onCurrencyChange: PropTypes.func.isRequired,
};