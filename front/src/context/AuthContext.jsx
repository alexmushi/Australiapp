import React, { createContext, useState, useContext } from 'react';
import { loginUser, registerUser } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    const u = await loginUser({ username, password });
    setUser(u);
  };

  const register = async (data) => {
    const u = await registerUser(data);
    setUser(u);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
