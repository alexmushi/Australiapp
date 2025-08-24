import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import ReviewerForm from '../components/ReviewerForm.jsx';
import CategoryForm from '../components/CategoryForm.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import Navbar from '../components/Navbar.jsx';
import Dashboard from '../components/Dashboard.jsx';
import Contact from '../components/Contact.jsx';

export default function HomePage() {
  const { user, logout, changeCurrency } = useAuth();
  const [view, setView] = useState('home');

  let content = <Dashboard />;
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
  if (view === 'expense') {
    content = (
      <div className='p-4'>
        <h2 className='text-xl mb-4'>Registrar gasto</h2>
        <ExpenseForm />
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
      <Contact />
    </div>
  );
}