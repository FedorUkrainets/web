'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlugZap } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) =>
    `flex items-center gap-2 rounded px-3 py-2 transition ${
      isActive(href) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4">
      <h2 className="mb-6 text-lg font-semibold text-slate-800">EV Panel</h2>
      <nav className="space-y-2 text-sm">
        <Link className={linkClass('/')} href="/">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link className={linkClass('/stations')} href="/stations">
          <PlugZap className="h-4 w-4" />
          Stations
        </Link>
      </nav>
    </aside>
  );
}
