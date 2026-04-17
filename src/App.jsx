import React, { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StationsPage from './pages/StationsPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  if (path === '/') {
    if (isAuthenticated) return <DashboardPage navigate={navigate} />;
    return <LoginPage navigate={navigate} />;
  }

  if (path === '/login') {
    return <LoginPage navigate={navigate} />;
  }

  if (path === '/register') {
    return <RegisterPage navigate={navigate} />;
  }

  if (path === '/dashboard') {
    return (
      <ProtectedRoute navigate={navigate}>
        <DashboardPage navigate={navigate} />
      </ProtectedRoute>
    );
  }

  if (path === '/stations') {
    return (
      <ProtectedRoute navigate={navigate}>
        <StationsPage navigate={navigate} />
      </ProtectedRoute>
    );
  }

  if (isAuthenticated) {
    return <DashboardPage navigate={navigate} />;
  }

  return <LoginPage navigate={navigate} />;
}
