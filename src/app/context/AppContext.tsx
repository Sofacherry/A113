import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'client' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  category?: 'Студент' | 'Взрослый' | 'Пенсионер';
  discount?: number;
  password: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  const setUser = (u: User | null) => setUserState(u);
  const logout = () => setUserState(null);

  return (
    <AppContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AppContext.Provider>
  );
}
