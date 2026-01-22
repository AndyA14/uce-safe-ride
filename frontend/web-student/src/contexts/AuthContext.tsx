import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/user';
import { loginUser as loginUserService, logoutUser } from '@/services/authService';
import { jwtDecode } from "jwt-decode";
interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 EFECTO DE INICIALIZACIÓN (Recargar página)
  useEffect(() => {
    console.log('[AuthContext] Inicializando...');
    const storedToken = localStorage.getItem('token');
    
    // Intentamos recuperar usuario del token si existe
    if (storedToken) {
      try {
        // 1. Decodificamos el token guardado
        const decoded: any = jwtDecode(storedToken);
        
        // 2. Reconstruimos el usuario con el ID real del token (decoded.sub)
        // Buscamos si hay un user guardado para complementar datos (nombre, etc)
        const storedUserStr = localStorage.getItem('user');
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};

        const recoveredUser: User = {
          ...storedUser,
          id: decoded.sub, // 🔥 ID CRÍTICO: Aseguramos que venga del token
          role: decoded.role || storedUser.role,
          email: decoded.email || storedUser.email
        };

        setUser(recoveredUser);
        setToken(storedToken);
      } catch (error) {
        console.error('❌ [AuthContext] Token inválido o expirado:', error);
        logout(); // Si falla, limpiamos todo
      }
    }
    setIsLoading(false);
  }, []);

  // 🚀 FUNCIÓN DE LOGIN
  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // 1. Petición al API
      const { user: userFromApi, access_token } = await loginUserService({ email, password }, role);
      
      // 2. Decodificamos el token para sacar el ID real (sub)
      const decoded: any = jwtDecode(access_token);
      console.log("🔓 Token Decodificado:", decoded);

      // 3. Armamos el objeto usuario final
      const finalUser: User = {
        ...userFromApi,
        id: decoded.sub, // 🔥 ID CRÍTICO: Usamos el del token (id_student)
        role: role // Aseguramos el rol
      };
      
      // 4. Actualizamos estados
      setUser(finalUser);
      setToken(access_token); 
      
      // 5. Guardamos en LocalStorage
      localStorage.setItem('user', JSON.stringify(finalUser));
      localStorage.setItem('token', access_token);

      return finalUser;
    } catch (error: any) {
      console.error("Login fallido:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null); 
    logoutUser();
    window.location.href = '/';
  };

  const value = {
    user,
    token, 
    setUser,
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