'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready, token } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-50 px-4 text-center text-slate-600">
        <p className="text-sm font-medium text-slate-800">Sign in required</p>
        <p className="max-w-sm text-xs text-slate-500">
          Redirecting to login… If nothing happens, open{' '}
          <a className="text-blue-600 underline" href="/login">
            /login
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto bg-[#f4f6f8] p-6">{children}</main>
      </div>
    </div>
  );
}
