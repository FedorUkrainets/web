import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ navigate, currentPath }) {
  const { logout } = useAuth();

  const navClass = (path) => (currentPath === path ? 'nav-btn nav-btn-active' : 'nav-btn');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <h2>EVCharge</h2>

      <nav className="nav-stack">
        <button type="button" className={navClass('/dashboard')} onClick={() => navigate('/dashboard')}>
          Панель управления
        </button>
        <button type="button" className={navClass('/stations')} onClick={() => navigate('/stations')}>
          Станции
        </button>
      </nav>

      <button type="button" className="secondary" onClick={handleLogout}>
        Выйти
      </button>
    </aside>
  );
}
