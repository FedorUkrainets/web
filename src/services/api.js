const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'access_token';

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export async function apiRequest(path, options = {}) {
  const { token: explicitToken, headers: extraHeaders, ...rest } = options;
  const token = explicitToken === null ? null : explicitToken ?? localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...rest, headers });

  if (response.status === 401) {
    if (onUnauthorized) onUnauthorized();
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Не авторизован');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}
