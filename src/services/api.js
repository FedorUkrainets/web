// Базовый URL берём из env. В dev — http://localhost:3001/api, в проде — Railway.
// Trailing slash зачищаем, чтобы избежать "//api/auth/login".
const RAW = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_BASE = RAW.replace(/\/+$/, '');

const TOKEN_KEY = 'access_token';
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function getApiBase() {
  return API_BASE;
}

export async function apiRequest(path, options = {}) {
  const { token: explicitToken, headers: extraHeaders, ...rest } = options;
  const token = explicitToken === null ? null : explicitToken ?? localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  let response;
  try {
    response = await fetch(url, { ...rest, headers });
  } catch (networkError) {
    // fetch падает здесь, если сервер недоступен или CORS запрещает запрос.
    console.error('[API] network error:', url, networkError);
    throw new Error(`Сервер недоступен: ${url}`);
  }

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
