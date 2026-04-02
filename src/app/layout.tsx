import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EV Station Management System',
  description: 'Charging network operations and analytics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
              Loading…
            </div>
          }
        >
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
