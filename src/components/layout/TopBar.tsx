'use client';

import { useAuth } from '@/contexts/auth-context';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-800">EV Station Dashboard</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">{user?.name ?? 'Guest'}</span>
        <button
          className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
