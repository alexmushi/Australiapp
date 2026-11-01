import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  loginUser,
  // registerUser,
  setAuthToken,
  setUnauthorizedHandler,
  updateUserCurrency,
} from '../services/api.js';

const AuthContext = createContext(null);
const LOCAL_KEY = 'auth_user';

function readStoredUser() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    // Sesiones guardadas antes de que existieran los tokens ya no sirven.
    if (parsed && typeof parsed.token !== 'string') {
      localStorage.removeItem(LOCAL_KEY);
      return null;
    }
    return parsed;
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
  const [user, setUser] = useState(() => {
    const u = readStoredUser();
    setAuthToken(u?.token);
    return u;
  });

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    writeStoredUser(null);
  }, []);

  // Si el servidor dice que la sesión expiró, vuelve al login.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = async (username, password, remember = false) => {
    const u = await loginUser({ username, password });
    setAuthToken(u.token);
    setUser(u);
    if (remember) writeStoredUser(u);
  };

  // const register = async (data) => {
  //   const u = await registerUser(data);
  //   setUser(u);
  // };

  const changeCurrency = async (code) => {
    if (!user) return;
    const updated = { ...(await updateUserCurrency(user.id, code)), token: user.token };
    setUser(updated);
    if (isRemembered()) writeStoredUser(updated);
  };

  const isReviewer = user?.role === 'reviewer';

  return (
    <AuthContext.Provider value={{ user, isReviewer, login, logout, changeCurrency }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = { children: PropTypes.node };

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
