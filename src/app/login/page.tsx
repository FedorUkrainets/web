'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@ev.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(searchParams.get('registered') === '1');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <h1 className="mb-4 text-xl font-semibold text-slate-800">Sign in</h1>
        {showRegistrationSuccess ? (
          <p className="mb-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Registration successful. Please sign in.
          </p>
        ) : null}
        <label className="mb-2 block text-sm text-slate-700">Email</label>
        <input
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          value={email}
        />
        <label className="mb-2 block text-sm text-slate-700">Password</label>
        <input
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          value={password}
        />
        {error ? <p className="mb-3 text-xs text-red-600">{error}</p> : null}
        <button
          className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link
            className="font-medium text-blue-600 underline"
            href="/register"
            onClick={() => setShowRegistrationSuccess(false)}
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
