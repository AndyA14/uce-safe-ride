import axios from 'axios';
import { LoginResponse, UserRole, User } from '@/types/user';
import { getStudentProfile } from './studentService';
import { getDriverProfile } from './driverService';

/* =========================
   CONFIG
========================= */
const AUTH_SERVICE_URL = 'http://localhost:8001/api/v1';

const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' }, 
});

/* =========================
   LOGIN
========================= */
export const loginUser = async (
  email: string,
  password: string,
  role: UserRole
): Promise<LoginResponse> => {
  try {
    const authResponse = await authApi.post('/auth/login', {
      email,
      password
    });
    const { access_token } = authResponse.data;
    localStorage.setItem('token', access_token);

    let userProfile: User | null = null;

    try {
      if (role === 'STUDENT') {
        const student = await getStudentProfile();
        userProfile = {
          id: student.student_id || student.full_name || 'unknown',
          name: student.full_name,
          email: student.email,
          role: 'STUDENT',
          phone: student.phone
        };
      } else if (role === 'DRIVER') {
        const driver = await getDriverProfile();
        userProfile = {
          id: driver.id || driver.user_id,
          name: driver.name, 
          email: driver.email,
          role: 'DRIVER',
          phone: driver.phone
        };
      } else {
         userProfile = {
            id: 'admin',
            name: 'Administrador',
            email: email,
            role: role
         };
      }
    } catch (profileError) {
      console.error('Error cargando perfil:', profileError);
      throw profileError;
    }

    return { user: userProfile, access_token };

  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        

        if (status === 401) throw new Error('Credenciales incorrectas');
        if (status === 422) throw new Error('Error de formato en el envío de datos (422).');
        if (status === 404) {
             if (error.config?.url?.includes('/me')) {
                 throw new Error(`Tu cuenta existe, pero no tienes un perfil de ${role.toLowerCase()} creado.`);
             }
        }
    }
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
      full_name: name,
      email,
      password,
      role,
    });

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

/* =========================
   LOGOUT
========================= */
export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return Promise.resolve();
};