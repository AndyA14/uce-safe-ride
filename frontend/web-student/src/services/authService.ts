import axios from 'axios';
import { User, UserRole } from '@/types/user';

const API_URL = 'http://localhost:8001';

/**
 * Configuración base de Axios
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * LOGIN
 */
export const loginUser = async (
  email: string,
  password: string,
  role: UserRole
): Promise<User> => {
  try {
    const response = await api.post('/api/v1/auth/login', {
      email,
      password,
    });

    // Guardar token
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }

    // Mapear usuario
    const userData: User = {
      id: response.data.id || response.data.user_id,
      name: response.data.full_name || response.data.name,
      email: response.data.email,
      role: response.data.role as UserRole,
    };

    // Guardar sesión
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  } catch (error) {
    console.error('Error en login:', error);
    throw new Error('Credenciales incorrectas o error del servidor');
  }
};

/**
 * REGISTER
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<User> => {
  try {
    const payload = {
      full_name: name,
      email,
      password,
      role,
    };

    const response = await api.post('/api/v1/auth/register', payload);

    return {
      id: response.data.id,
      name: response.data.full_name,
      email: response.data.email,
      role: response.data.role as UserRole,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

/**
 * LOGOUT (limpieza completa)
 */
export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.clear(); // limpieza profunda por seguridad
  return Promise.resolve();
};

/**
 * SESIÓN ACTUAL
 */
export const getCurrentSession = async (): Promise<User | null> => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
