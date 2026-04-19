import React, { useCallback, useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StationsPage from './pages/StationsPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './context/AuthContext';

// Единые гарды: если не авторизован — показываем только auth-экраны.
const PUBLIC_ROUTES = new Set(['/login', '/register']);

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const { isAuthenticated, isReady } = useAuth();

  const navigate = useCallback((nextPath) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setPath(nextPath);
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Guard: неавторизованных всегда ведём на /login (кроме /register).
  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated && !PUBLIC_ROUTES.has(path)) {
      navigate('/login');
    }
    if (isAuthenticated && PUBLIC_ROUTES.has(path)) {
      navigate('/dashboard');
    }
  }, [isReady, isAuthenticated, path, navigate]);

  if (!isReady) return null;

  if (!isAuthenticated) {
    if (path === '/register') return <RegisterPage navigate={navigate} />;
    return <LoginPage navigate={navigate} />;
  }

  switch (path) {
    case '/stations':
      return <StationsPage navigate={navigate} currentPath={path} />;
    case '/dashboard':
    default:
      return <DashboardPage navigate={navigate} currentPath={path} />;
  }
}
