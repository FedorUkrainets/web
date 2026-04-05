'use client';

import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4">
      <h2 className="mb-6 text-lg font-semibold text-slate-800">EV Panel</h2>
      <nav className="space-y-2 text-sm">
        <Link className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-100" href="/">
          Dashboard
        </Link>
      </nav>
    </aside>
  );
}
