import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthCard from '../components/auth/AuthCard.jsx';

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      console.error(err);
      alert('Invalid credentials');
    }
  };

  return (
    <AuthCard title="Login" description="Sign in to your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
        <p>
          Don't have an account?{' '}
          <button type="button" onClick={onSwitch}>
            Register
          </button>
        </p>
      </form>
    </AuthCard>
  );
}