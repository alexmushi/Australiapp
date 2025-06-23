import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';

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

  return <HomePage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
}
