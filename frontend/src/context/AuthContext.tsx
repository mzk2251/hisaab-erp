import { createContext, useContext, useState, type ReactNode } from 'react';
import { clearSession, getSession, login as apiLogin, type AuthSession } from '../api/client';

interface AuthContextValue {
  session: AuthSession | null;
  login: (email: string, password: string, companyCode: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getSession());

  async function login(email: string, password: string, companyCode: string) {
    const result = await apiLogin(email, password, companyCode);
    setSession(result);
  }

  function logout() {
    clearSession();
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
