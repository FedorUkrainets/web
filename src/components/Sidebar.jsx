import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ navigate }) {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <h2>EV Demo</h2>
      <nav>
        <button type="button" className="secondary" onClick={() => navigate('/stations')}>Stations</button>
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
