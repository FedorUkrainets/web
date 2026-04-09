import React, { createContext, useContext, useMemo, useState } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  const value = useMemo(() => ({
    token,
    isAuthenticated: Boolean(token),
    async login(email, password) {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        token: null,
      });
      localStorage.setItem('access_token', result.access_token);
      setToken(result.access_token);
    },
    logout() {
      localStorage.removeItem('access_token');
      setToken(null);
    },
  }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
