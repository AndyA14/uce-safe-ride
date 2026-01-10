/**
 * Authentication Context - REAL
 * Gestiona el estado de la sesión conectado al Backend FastAPI
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/user';
import { loginUser, logoutUser, getCurrentSession } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Para saber si estamos verificando sesión al inicio
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Al cargar la app, verificamos si ya existe una sesión guardada
  useEffect(() => {
    const initSession = async () => {
      try {
        const savedUser = await getCurrentSession();
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error("Error recuperando sesión:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  // 2. Login Real (Async)
  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // Llamamos al servicio que conecta con FastAPI
      const userData = await loginUser(email, password, role);
      setUser(userData);
    } catch (error) {
      // Propagamos el error para que el componente Login pueda mostrar el mensaje rojo
      throw error;
    }
  };

  // 3. Logout Real
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      // Opcional: Redirigir al login o limpiar estados
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};