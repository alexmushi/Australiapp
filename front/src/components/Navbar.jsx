import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-surface p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-primary">Inicio</Link>
          <Link to="/budgets" className="hover:text-primary">Presupuestos</Link>
          <Link to="/expenses" className="hover:text-primary">Gastos</Link>
          <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
          <Link to="/alerts" className="hover:text-primary">Alertas</Link>
          <Link to="/reviewers" className="hover:text-primary">Revisores</Link>
        </div>
        {user && (
          <button onClick={logout} className="text-sm text-red-400 hover:underline">
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}
