import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { logout } = useAuth();

  const linkClass = 'px-3 py-2 hover:underline';

  return (
    <nav className='bg-surface text-gray-200 p-4 flex space-x-4'>
      <Link to='/' className={linkClass}>Inicio</Link>
      <Link to='/dashboard' className={linkClass}>Dashboard</Link>
      <Link to='/categories' className={linkClass}>Categorías</Link>
      <Link to='/budgets' className={linkClass}>Presupuestos</Link>
      <Link to='/expenses' className={linkClass}>Gastos</Link>
      <Link to='/alerts' className={linkClass}>Alertas</Link>
      <Link to='/reviewers' className={linkClass}>Revisores</Link>
      <button onClick={logout} className={linkClass}>Salir</button>
    </nav>
  );
}
