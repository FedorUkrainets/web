import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'access_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isReady, setIsReady] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  // Глобальный 401-хендлер: если сервер сказал «unauthorized» — чистим токен.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    setIsReady(true);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      token: null,
    });
    if (!result?.access_token) {
      throw new Error('Некорректный ответ сервера');
    }
    localStorage.setItem(TOKEN_KEY, result.access_token);
    setToken(result.access_token);
  }, []);

  const value = useMemo(() => ({
    token,
    isAuthenticated: Boolean(token),
    isReady,
    login,
    logout,
  }), [token, isReady, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
