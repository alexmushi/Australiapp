import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { loginUser, /* registerUser, */ updateUserCurrency } from '../services/api.js';

const AuthContext = createContext(null);
const LOCAL_KEY = 'auth_user';

function readStoredUser() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Failed to parse stored user', e);
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch {
      // almacenamiento no disponible
    }
    return null;
  }
}

function writeStoredUser(user) {
  try {
    if (user) localStorage.setItem(LOCAL_KEY, JSON.stringify(user));
    else localStorage.removeItem(LOCAL_KEY);
  } catch {
    // almacenamiento no disponible (modo privado, etc.)
  }
}

function isRemembered() {
  try {
    return localStorage.getItem(LOCAL_KEY) !== null;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  // Se lee de forma síncrona para no mostrar el login un instante al recargar.
  const [user, setUser] = useState(readStoredUser);

  const login = async (username, password, remember = false) => {
    const u = await loginUser({ username, password });
    setUser(u);
    if (remember) writeStoredUser(u);
  };

  // const register = async (data) => {
  //   const u = await registerUser(data);
  //   setUser(u);
  // };

  const changeCurrency = async (code) => {
    if (!user) return;
    const updated = await updateUserCurrency(user.id, code);
    setUser(updated);
    if (isRemembered()) writeStoredUser(updated);
  };

  const logout = () => {
    setUser(null);
    writeStoredUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changeCurrency }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = { children: PropTypes.node };

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
