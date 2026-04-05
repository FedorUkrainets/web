'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

const STORAGE_KEY = 'ev_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = localStorage.getItem(STORAGE_KEY);
    setToken(t);
    if (!t) {
      setReady(true);
      return;
    }
    apiFetch<AuthUser>('/auth/me', { token: t, timeoutMs: 8000 })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const publicPaths = ['/login', '/register'];
    if (!token && !publicPaths.includes(pathname)) {
      router.replace('/login');
    }
    if (token && publicPaths.includes(pathname)) {
      router.replace('/');
    }
  }, [ready, token, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{
      access_token: string;
      token_type: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      token: null,
    });

    if (res.token_type.toLowerCase() !== 'bearer') {
      throw new Error('Unexpected token type from server');
    }

    const tok = res.access_token;
    localStorage.setItem(STORAGE_KEY, tok);
    setToken(tok);
    const me = await apiFetch<{ id: string; email: string; fullName: string; role: string }>('/auth/me', {
      token: tok,
    });
    setUser({
      id: me.id,
      email: me.email,
      name: me.fullName,
      role: me.role,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(
    () => ({ token, user, ready, login, logout }),
    [token, user, ready, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
