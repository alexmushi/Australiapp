import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser, updateUserCurrency } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const LOCAL_KEY = 'auth_user';

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem(LOCAL_KEY);
      }
    }
  }, []);

  const login = async (username, password, remember = false) => {
    const u = await loginUser({ username, password });
    setUser(u);
    if (remember) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(u));
    }
  };

  const register = async (data) => {
    const u = await registerUser(data);
    setUser(u);
  };

  const changeCurrency = async (code) => {
    if (!user) return;
    const updated = await updateUserCurrency(user.id, code);
    setUser(updated);
    if (localStorage.getItem(LOCAL_KEY)) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, changeCurrency }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;