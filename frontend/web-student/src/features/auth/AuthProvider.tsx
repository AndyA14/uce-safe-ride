import { createContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('access_token')
  );

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token); // Mantener compatibilidad
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token'); // Mantener compatibilidad
    setToken(null);
    // Redirigir al home después de cerrar sesión
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
