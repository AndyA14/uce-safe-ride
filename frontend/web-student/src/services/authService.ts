import axios from 'axios';
import { LoginResponse, UserRole, User, DriverStatus } from '@/types/user';
import { getStudentProfile } from './studentService';
import { getDriverProfile } from './driverService';

/* =========================
   CONFIG
========================= */
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8001/api/v1';

console.log('🔧 AUTH_SERVICE_URL configurado:', AUTH_SERVICE_URL);

const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
});

// ✅ Interceptor para logging de requests
authApi.interceptors.request.use(
  (config) => {
    console.log('📤 Request enviado:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// ✅ Interceptor para logging de responses
authApi.interceptors.response.use(
  (response) => {
    console.log('✅ Response recibido:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
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
        data: error.config?.data
      }
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
    console.log('🌐 URL Auth Service:', AUTH_SERVICE_URL);

    // ✅ Limpiar cualquier sesión anterior
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Preparar payload
    const loginPayload = {
      email: credentials.email.trim(), // ✅ Eliminar espacios
      password: credentials.password,
    };

    console.log('📦 Payload:', { email: loginPayload.email, password: '***' });

    // ✅ Hacer login en Auth Service
    console.log('📤 Enviando petición a /auth/login...');
    
    const authResponse = await authApi.post('/auth/login', loginPayload, {
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    console.log('✅ Respuesta del Auth Service recibida');
    console.log('📊 Status:', authResponse.status);
    console.log('📦 Data:', authResponse.data);

    const { access_token } = authResponse.data;
    
    if (!access_token) {
      throw new Error('No se recibió token de autenticación');
    }

    console.log('🔑 Token recibido:', access_token.substring(0, 50) + '...');

    // 🔍 Decodificar token para debugging
    try {
      const tokenParts = access_token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('🔐 Contenido del token:', {
        sub: payload.sub,
        role: payload.role,
        exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'
      });
    } catch (e) {
      console.warn('⚠️ No se pudo decodificar el token:', e);
    }

    // Guardar token para las siguientes peticiones
    localStorage.setItem('token', access_token);
    console.log('💾 Token guardado en localStorage');

    // ✅ Obtener perfil según rol
    let userProfile: User | null = null;

    try {
      console.log(`\n📋 Obteniendo perfil de ${role}...`);

      if (role === 'STUDENT') {
        const student = await getStudentProfile();
        console.log('✅ Perfil de estudiante:', student);
        
        userProfile = {
          id: student.user_id || student.student_id || 'unknown',
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
        console.log('✅ Perfil de conductor:', driver);
        
        userProfile = {
          id: driver.user_id || driver.id || 'unknown',
          name: driver.name,
          email: driver.email,
          role: 'DRIVER',
          phone: driver.phone || undefined,
          ci: driver.ci,
          license_number: driver.license_number,
          status: (driver.status || 'AVAILABLE') as DriverStatus,
        };
      } else {
        // ADMIN
        console.log('👤 Creando perfil de administrador...');
        userProfile = {
          id: 'admin',
          name: 'Administrador',
          email: credentials.email,
          role,
        };
      }

      console.log('✅ Perfil final creado:', userProfile);

    } catch (profileError: any) {
      console.error('❌ Error cargando perfil:', profileError);
      console.error('Stack:', profileError.stack);
      
      // Limpiar token si falla el perfil
      localStorage.removeItem('token');
      
      if (profileError.response?.status === 404) {
        const errorDetail = profileError.response?.data?.detail || 'No especificado';
        throw new Error(
          `Tu cuenta existe, pero no se encontró tu perfil de ${role.toLowerCase()}.\n\n` +
          `Detalle técnico: ${errorDetail}\n\n` +
          `Por favor contacta al administrador.`
        );
      }
      
      if (profileError.response?.status === 401) {
        throw new Error('Token inválido o expirado. Intenta iniciar sesión nuevamente.');
      }
      
      throw new Error(`Error al obtener perfil: ${profileError.message}`);
    }

    if (!userProfile) {
      throw new Error('No se pudo crear el perfil del usuario');
    }

    console.log('✅ LOGIN EXITOSO');
    console.log('='.repeat(60) + '\n');

    return { user: userProfile, access_token };

  } catch (error: any) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ERROR EN LOGIN');
    console.error('='.repeat(60));
    
    // Limpiar token en caso de error
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      console.error('Tipo: Axios Error');
      console.error('Status:', status);
      console.error('Detail:', detail);
      console.error('Full response:', error.response?.data);
      console.error('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        data: error.config?.data
      });
      
      if (status === 401) {
        throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
      }
      
      if (status === 422) {
        throw new Error(
          'Error de validación: El servidor no pudo procesar los datos. ' +
          'Verifica que el email sea válido.'
        );
      }
      
      if (status === 404) {
        throw new Error('Servicio de autenticación no disponible.');
      }
      
      throw new Error(detail || 'Error al conectar con el servidor de autenticación.');
    }
    
    console.error('Tipo: Error genérico');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(60) + '\n');
    
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
  try {
    const response = await authApi.post('/auth/register', {
      email: email.trim(),
      password,
      role,
    });  

    return {
      id: response.data.id,
      name: name,
      email: response.data.email,
      role: response.data.role as UserRole,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

/* =========================
   LOGOUT
========================= */
export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return Promise.resolve();
};  