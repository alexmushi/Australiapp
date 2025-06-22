import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import ReviewersPage from './pages/ReviewersPage.jsx';

function Content() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    return showRegister ? (
      <RegisterPage onSwitch={() => setShowRegister(false)} />
    ) : (
      <LoginPage onSwitch={() => setShowRegister(true)} />
    );
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/categories' element={<CategoriesPage />} />
        <Route path='/budgets' element={<BudgetsPage />} />
        <Route path='/expenses' element={<ExpensesPage />} />
        <Route path='/alerts' element={<AlertsPage />} />
        <Route path='/reviewers' element={<ReviewersPage />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
}