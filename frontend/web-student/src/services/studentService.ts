import axios from 'axios';
import { CustomRoute, CreateCustomRoutePayload } from '@/types/route';

/* =========================
   CONFIGURACIÓN DE AXIOS
========================= */

// 1️⃣ Base URL apuntando al microservicio de estudiantes
const API_URL = 'http://localhost:8002/api/v1';

const studentHttp = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2️⃣ Interceptor para enviar token automáticamente
studentHttp.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   TIPOS DE DATOS
========================= */

export interface StudentProfile {
  user_id: string;
  role: string;
  email: string;
  full_name: string;
  phone?: string;
  student_id?: string;
  career?: string;
  semester?: number;
}

export interface StudentProfileUpdate {
  full_name?: string;
  phone?: string;
  career?: string;
  semester?: number;
}

/* =========================
   PERFIL DEL ESTUDIANTE
========================= */

export const getStudentProfile = async (): Promise<StudentProfile> => {
  try {
    const response = await studentHttp.get<StudentProfile>('/students/me');
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo perfil del estudiante:', error);
    throw error;
  }
};

export const updateStudentProfile = async (
  data: StudentProfileUpdate
): Promise<StudentProfile> => {
  try {
    const payload: StudentProfileUpdate = {};

    if (data.full_name !== undefined) payload.full_name = data.full_name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.career !== undefined) payload.career = data.career;
    if (data.semester !== undefined) payload.semester = data.semester;

    const response = await studentHttp.put<StudentProfile>(
      '/students/me',
      payload
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando perfil del estudiante:', error);
    throw error;
  }
};

/* =========================
   RUTAS PERSONALIZADAS
========================= */

export const getCustomRoutes = async (): Promise<CustomRoute[]> => {
  try {
    const response = await studentHttp.get<CustomRoute[]>('/students/me/custom-routes');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error obteniendo rutas personalizadas:', error);
    return [];
  }
};

export const createCustomRoute = async (
  data: CreateCustomRoutePayload
): Promise<CustomRoute> => {
  try {
    const response = await studentHttp.post<CustomRoute>(
      '/students/me/custom-routes',
      data
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error creando ruta personalizada:', error);
    throw error;
  }
};

export const updateCustomRoute = async (
  id: string,
  data: Partial<CreateCustomRoutePayload>
): Promise<CustomRoute> => {
  try {
    const response = await studentHttp.put<CustomRoute>(
      `/students/me/custom-routes/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando ruta personalizada:', error);
    throw error;
  }
};

export const deleteCustomRoute = async (id: string): Promise<void> => {
  try {
    await studentHttp.delete(`/students/me/custom-routes/${id}`);
  } catch (error) {
    console.error('❌ Error eliminando ruta personalizada:', error);
    throw error;
  }
};

/* =========================
   EXPORT DEFAULT
========================= */
export default {
  getStudentProfile,
  updateStudentProfile,
  getCustomRoutes,
  createCustomRoute,
  updateCustomRoute,
  deleteCustomRoute,
};
