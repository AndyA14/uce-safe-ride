import axios from 'axios';
import { StudentProfile } from '@/types/user';

const STUDENT_API_URL = 'http://localhost:8002';

const api = axios.create({
  baseURL: STUDENT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * OBTENER PERFIL
 */
export const getStudentProfile = async (): Promise<StudentProfile> => {
  try {
    const response = await api.get('/api/v1/students/me');
    return response.data;
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    throw error;
  }
};

/**
 * ACTUALIZAR PERFIL
 */
export const updateStudentProfile = async (data: Partial<StudentProfile>) => {
  try {
    const response = await api.put('/api/v1/students/me', data);
    return response.data;
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    throw error;
  }

};