const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export interface AuthSession {
  token: string;
  user: { id: string; name: string; email: string; role: string };
  company: { id: string; name: string; code: string };
}

export function getToken(): string | null {
  return localStorage.getItem('hisaab_token');
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem('hisaab_session');
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session: AuthSession) {
  localStorage.setItem('hisaab_token', session.token);
  localStorage.setItem('hisaab_session', JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem('hisaab_token');
  localStorage.removeItem('hisaab_session');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function login(email: string, password: string, companyCode: string) {
  const session = await api<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, companyCode }),
  });
  setSession(session);
  return session;
}
