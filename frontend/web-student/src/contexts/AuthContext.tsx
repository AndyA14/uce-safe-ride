/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/user';
import { loginUser as loginUserService, logoutUser } from '@/services/authService';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// ✅ Interfaz para tipar el contenido del token JWT
interface CustomJwtPayload {
  sub: string;
  role: UserRole;
  email: string;
}

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

  /* ======================================================
     🔄 EFECTO DE INICIALIZACIÓN (Recarga de página)
  ====================================================== */
  useEffect(() => {
    console.log('='.repeat(60));
    console.log('[AuthContext] Inicializando...');
    console.log('='.repeat(60));
    
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      try {
        // 1. Decodificar token (Tipado correctamente)
        const decoded = jwtDecode<CustomJwtPayload>(storedToken);
        console.log('[AuthContext] Token decodificado:', {
          sub: decoded.sub,
          role: decoded.role,
          email: decoded.email,
        });

        // 2. Recuperar usuario almacenado
        const storedUserStr = localStorage.getItem('user');
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};

        // 3. Reconstruir usuario base
        const recoveredUser: User = {
          ...storedUser,
          id: decoded.sub,           // ✅ ID de Auth (crítico)
          driver_id: storedUser.driver_id || null, // ✅ Driver ID si existe
          role: decoded.role || storedUser.role,
          email: decoded.email || storedUser.email,
          name: storedUser.name || decoded.email,
        };

        console.log('[AuthContext] Usuario recuperado:', {
          id: recoveredUser.id,
          driver_id: recoveredUser.driver_id,
          role: recoveredUser.role,
          name: recoveredUser.name,
        });

        // 4. Si es conductor y no tiene driver_id, intentar obtenerlo
        if (recoveredUser.role === 'DRIVER' && !recoveredUser.driver_id) {
          console.log('[AuthContext] Conductor sin driver_id, obteniendo...');
          
          fetchDriverId(storedToken)
            .then((driverId) => {
              if (driverId) {
                recoveredUser.driver_id = driverId;
                localStorage.setItem('user', JSON.stringify(recoveredUser));
                console.log('✅ [AuthContext] Driver ID obtenido:', driverId);
              }
              setUser(recoveredUser);
              setToken(storedToken);
            })
            .catch((err: unknown) => {
              const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
              console.warn('⚠️ [AuthContext] No se pudo obtener driver_id:', errorMessage);
              // No bloqueamos el login, se obtendrá en el Dashboard
              setUser(recoveredUser);
              setToken(storedToken);
            });
        } else {
          setUser(recoveredUser);
          setToken(storedToken);
        }
      } catch (error: unknown) {
        console.error('❌ [AuthContext] Token inválido o expirado:', error);
        logout();
      }
    }

    setIsLoading(false);
    console.log('='.repeat(60));
  }, []);

  /* ======================================================
     🚀 FUNCIÓN DE LOGIN
  ====================================================== */
  const login = async (email: string, password: string, role: UserRole) => {
    try {
      console.log('='.repeat(60));
      console.log('🔐 INICIANDO LOGIN');
      console.log('='.repeat(60));
      console.log('Email:', email);
      console.log('Role:', role);

      // 1. Petición al API de Auth
      const { user: userFromApi, access_token } = await loginUserService(
        { email, password },
        role
      );

      // 2. Decodificar token (Tipado correctamente)
      const decoded = jwtDecode<CustomJwtPayload>(access_token);
      console.log('🔓 Token decodificado:', {
        sub: decoded.sub,
        role: decoded.role,
        email: decoded.email,
      });

      // 3. Intentar obtener driver_id si es conductor (NO BLOQUEANTE)
      let realDriverId: string | null = null;
      if (role === 'DRIVER') {
        try {
          realDriverId = await fetchDriverId(access_token);
          console.log('✅ Driver ID obtenido:', realDriverId);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          console.warn('⚠️ No se pudo obtener driver_id en login:', errorMessage);
          console.warn('   Se obtendrá en el Dashboard');
          // No lanzamos error, continuamos sin driver_id
        }
      }

      // 4. Armar usuario final
      const finalUser: User = {
        ...userFromApi,
        id: decoded.sub,        // ✅ ID de Auth
        driver_id: realDriverId, // ✅ Driver ID (puede ser null)
        role: role,
        email: decoded.email || email,
        name: userFromApi.name || decoded.email,
      };

      console.log('✅ Usuario final:', {
        id: finalUser.id,
        driver_id: finalUser.driver_id,
        role: finalUser.role,
        name: finalUser.name,
      });

      // 5. Guardar en estado y localStorage
      setUser(finalUser);
      setToken(access_token);
      localStorage.setItem('user', JSON.stringify(finalUser));
      localStorage.setItem('token', access_token);

      console.log('='.repeat(60));
      console.log('✅ LOGIN EXITOSO');
      console.log('='.repeat(60));

      return finalUser;
    } catch (error: unknown) {
      console.error('❌ Login fallido:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error;
    }
  };

  /* ======================================================
     🔍 FUNCIÓN PARA OBTENER DRIVER_ID (Puerto 8005)
  ====================================================== */
  const fetchDriverId = async (token: string): Promise<string> => {
    try {
      console.log('🔍 Consultando Driver Service (puerto 8005)...');
      
      // ✅ ENDPOINT CORRECTO: /drivers/me
      const response = await axios.get(
        'http://localhost:8005/api/v1/drivers/me',
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );

      const driverId = response.data.id;
      
      if (!driverId) {
        throw new Error('Response no contiene ID de conductor');
      }

      console.log('✅ Driver ID obtenido:', driverId);
      return driverId;
    } catch (error: unknown) {
      // ✅ Validación correcta de errores de Axios en TypeScript
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('❌ Error HTTP:', {
            status: error.response.status,
            data: error.response.data,
          });
          throw new Error(`No se pudo obtener driver_id: ${error.response.status}`);
        } else if (error.request) {
          console.error('❌ Sin respuesta del servidor:', error.message);
          throw new Error(`No se pudo obtener driver_id: ${error.message}`);
        }
      } 
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error:', errorMessage);
      throw new Error(`No se pudo obtener driver_id: ${errorMessage}`);
    }
  };

  /* ======================================================
     🚪 FUNCIÓN DE LOGOUT
  ====================================================== */
  const logout = () => {
    console.log('🚪 Cerrando sesión...');
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};