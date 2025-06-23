import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import ReviewerForm from '../components/ReviewerForm.jsx';
import CategoryForm from '../components/CategoryForm.jsx';
import Navbar from '../components/Navbar.jsx';

export default function HomePage() {
  const { user, logout, changeCurrency } = useAuth();
  const [view, setView] = useState('home');

  let content = (
    <div className='p-4'>Bienvenido, {user.username}</div>
  );
  if (view === 'reviewer') {
    content = (
      <div className='p-4'>
        <h2 className='text-xl mb-4'>Agregar revisor</h2>
        <ReviewerForm />
      </div>
    );
  }
  if (view === 'category') {
    content = (
      <div className='p-4'>
        <h2 className='text-xl mb-4'>Nueva categoría</h2>
        <CategoryForm />
      </div>
    );
  }

  return (
    <div>
      <Navbar
        onNavigate={setView}
        onLogout={logout}
        currency={user.default_currency_code}
        onCurrencyChange={changeCurrency}
      />
      {content}
    </div>
  );
}