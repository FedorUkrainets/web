import React, { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StationsPage from './pages/StationsPage';
import ProtectedRoute from './components/ProtectedRoute';

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  if (path === '/register') {
    return <RegisterPage navigate={navigate} />;
  }

  if (path === '/stations') {
    return (
      <ProtectedRoute navigate={navigate}>
        <StationsPage navigate={navigate} />
      </ProtectedRoute>
    );
  }

  return <LoginPage navigate={navigate} />;
}
