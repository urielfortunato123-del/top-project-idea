import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/photo';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Uriel Fortunato',
    email: 'uriel@obraphoto.com',
    password: '123456',
    role: 'colaborador',
    companyId: 'habittechene',
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@obraphoto.com',
    password: '123456',
    role: 'gestor',
    companyId: 'habittechene',
  },
  {
    id: '3',
    name: 'Admin',
    email: 'admin@obraphoto.com',
    password: 'admin',
    role: 'admin',
    companyId: 'habittechene',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('obraphoto_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('obraphoto_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('obraphoto_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}