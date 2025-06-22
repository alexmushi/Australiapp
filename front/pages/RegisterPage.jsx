import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage({ onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ username, password, default_currency_code: currency });
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency code" />
      <button type="submit">Register</button>
      <p>
        Already have an account? <button type="button" onClick={onSwitch}>Login</button>
      </p>
    </form>
  );
}

