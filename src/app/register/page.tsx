'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
        token: null,
      });
      router.replace('/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <h1 className="mb-4 text-xl font-semibold text-slate-800">Create account</h1>

        <label className="mb-2 block text-sm text-slate-700">Full name</label>
        <input
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          onChange={(e) => setFullName(e.target.value)}
          required
          type="text"
          value={fullName}
        />

        <label className="mb-2 block text-sm text-slate-700">Email</label>
        <input
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />

        <label className="mb-2 block text-sm text-slate-700">Password</label>
        <input
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />

        <label className="mb-2 block text-sm text-slate-700">Confirm password</label>
        <input
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          minLength={6}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          type="password"
          value={confirmPassword}
        />

        {error ? <p className="mb-3 text-xs text-red-600">{error}</p> : null}
        <button
          className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-medium text-blue-600 underline" href="/login">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
