import React from 'react';
import { useAuth } from '../context/AuthContext';

function navClass(path) {
  const active = window.location.pathname === path;
  return active ? 'nav-btn nav-btn-active' : 'nav-btn';
}

export default function Sidebar({ navigate }) {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <h2>EV Demo</h2>

      <nav className="nav-stack">
        <button type="button" className={navClass('/dashboard')} onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
        <button type="button" className={navClass('/stations')} onClick={() => navigate('/stations')}>
          Stations
        </button>
      </nav>

      <button
        type="button"
        className="secondary"
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        Logout
      </button>
    </aside>
  );
}
