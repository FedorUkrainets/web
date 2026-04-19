import React from 'react';
import { useAuth } from '../context/AuthContext';

// Guard-обёртка (оставлена как утилита — роутинг теперь в App.jsx).
export default function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated, isReady } = useAuth();
  if (!isReady) return null;
  if (!isAuthenticated) return fallback;
  return children;
}
