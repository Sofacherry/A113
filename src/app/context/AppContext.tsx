import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { loginRequest, meRequest, registerRequest, BackendRole } from '../api/authApi';

export type UserRole = 'client' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  backendRole: BackendRole;
  avatar?: string;
  category?: 'Студент' | 'Взрослый' | 'Пенсионер';
  discount?: number;
  password: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  initializing: boolean;
  setUser: (user: User | null) => void;
  init: () => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { displayName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  token: null,
  initializing: false,
  setUser: () => {},
  init: async () => {},
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useApp = () => useContext(AppContext);

const TOKEN_KEY = 'a113_token';

function toClientRole(role: BackendRole): UserRole {
  if (role === 'Client') return 'client';
  if (role === 'Manager') return 'manager';
  return 'admin';
}

function normalizeUser(data: { id: string | number; email: string; displayName: string; role: BackendRole }): User {
  const role = toClientRole(data.role);
  return {
    id: String(data.id),
    name: data.displayName,
    email: data.email,
    password: '',
    role,
    backendRole: data.role,
    category: role === 'client' ? 'Студент' : undefined,
    discount: role === 'client' ? 15 : undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  const setUser = useCallback((u: User | null) => setUserState(u), []);
  const logout = useCallback(() => {
    setUserState(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const init = useCallback(async () => {
    setInitializing(true);
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setInitializing(false);
        return;
      }
      const me = await meRequest(savedToken);
      setToken(savedToken);
      setUserState(normalizeUser(me));
    } catch (_error) {
      logout();
    } finally {
      setInitializing(false);
    }
  }, [logout]);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const auth = await loginRequest(payload);
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    setToken(auth.accessToken);
    setUserState(normalizeUser(auth.user));
  }, []);

  const register = useCallback(async (payload: { displayName: string; email: string; password: string }) => {
    const auth = await registerRequest(payload);
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    setToken(auth.accessToken);
    setUserState(normalizeUser(auth.user));
  }, []);

  const value = useMemo(
    () => ({ user, token, initializing, setUser, init, login, register, logout }),
    [user, token, initializing]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
