import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/user';
import { loginUser as loginUserService, logoutUser } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // <-- agregamos
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Inicializando...');
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        console.log('[AuthContext] Sesión restaurada:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ [AuthContext] Error leyendo sesión local:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('ℹ[AuthContext] No hay sesión guardada');
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      console.log('[AuthContext] Iniciando login...');
      const { user: userFromApi, access_token } = await loginUserService({ email, password }, role);

      console.log('✅ [AuthContext] Login exitoso:', userFromApi);
      setUser(userFromApi);
      localStorage.setItem('user', JSON.stringify(userFromApi));
      localStorage.setItem('token', access_token);

      return userFromApi;
    } catch (error: any) {
      console.error('❌ [AuthContext] Error en login:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = () => {
    console.log('[AuthContext] Cerrando sesión...');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    logoutUser();
    window.location.href = '/';
  };

  const value = {
    user,
    setUser, // <-- exportamos setUser
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
