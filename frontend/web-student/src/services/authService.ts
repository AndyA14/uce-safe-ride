import axios from 'axios';
import { LoginResponse, UserRole, User } from '@/types/user';
import { getStudentProfile } from './studentService';
import { getDriverProfile } from '@/services/driverService';

/* =========================
   CONFIG
========================= */
const AUTH_SERVICE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8001/api/v1';

console.log('🔧 AUTH_SERVICE_URL configurado:', AUTH_SERVICE_URL);

const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
});

// 📤 Request interceptor (logging)
authApi.interceptors.request.use(
  (config) => {
    console.log('📤 Request enviado:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// 📥 Response interceptor (logging)
authApi.interceptors.response.use(
  (response) => {
    console.log('✅ Response recibido:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });
    return Promise.reject(error);
  }
);

/* =========================
   TIPOS
========================= */
export interface LoginCredentials {
  email: string;
  password: string;
}

/* =========================
   LOGIN UNIFICADO
========================= */
export const loginUser = async (
  credentials: LoginCredentials,
  role: UserRole
): Promise<LoginResponse> => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 INICIANDO LOGIN');
    console.log('='.repeat(60));
    console.log('📧 Email:', credentials.email);
    console.log('👤 Rol:', role);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const loginPayload = {
      email: credentials.email.trim(),
      password: credentials.password,
    };

    console.log('📦 Payload:', {
      email: loginPayload.email,
      password: '***',
    });

    const authResponse = await authApi.post('/auth/login', loginPayload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const { access_token } = authResponse.data;
    if (!access_token) {
      throw new Error('No se recibió token de autenticación');
    }

    localStorage.setItem('token', access_token);

    let userProfile: User;

    try {
      if (role === 'STUDENT') {
        const student = await getStudentProfile();

        userProfile = {
          id: student.student_id || 'unknown',
          name: student.full_name,
          email: student.email,
          role: 'STUDENT',
          phone: student.phone,
          student_id: student.student_id,
          career: student.career,
          semester: student.semester,
        };
      } else if (role === 'DRIVER') {
        const driver = await getDriverProfile();
        if (!driver) {
          throw new Error('Perfil de conductor no encontrado');
        }

        userProfile = {
          id: driver.id,
          name: driver.name,
          email: driver.email,
          role: 'DRIVER',
          phone: driver.phone || undefined,
          license_number: driver.license_number,
        };
      } else {
        // ADMIN u otros roles
        userProfile = {
          id: 'admin',
          name: 'Administrador',
          email: credentials.email,
          role,
        };
      }
    } catch (profileError) {
      localStorage.removeItem('token');
      throw profileError;
    }

    localStorage.setItem('user', JSON.stringify(userProfile));

    return {
      user: userProfile,
      access_token,
    };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

/* =========================
   REGISTER
========================= */
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<User> => {
  const response = await authApi.post('/auth/register', {
    email: email.trim(),
    password,
    role,
  });

  return {
    id: response.data.id,
    name,
    email: response.data.email,
    role: response.data.role as UserRole,
  };
};

/* =========================
   LOGOUT
========================= */
export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return Promise.resolve();
};
