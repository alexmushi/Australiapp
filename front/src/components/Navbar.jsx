import React from 'react';
import PropTypes from 'prop-types';

export default function Navbar({ onNavigate, onLogout }) {
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
      <button className='hover:underline' onClick={onLogout}>
        Cerrar sesión
      </button>
    </nav>
  );
}

Navbar.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};
