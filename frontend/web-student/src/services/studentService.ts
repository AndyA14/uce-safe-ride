import axios, { InternalAxiosRequestConfig } from 'axios';
import { CustomRoute, CreateCustomRoutePayload } from '@/types/route';

/* =========================
   TIPOS
========================= */
export interface StudentProfile {
  full_name: string;
  email: string;
  phone?: string;
  student_id?: string;
  career?: string;
  semester?: number;
  user_id?: string;
  role?: string;
}

/* =========================
   CONFIG AXIOS
========================= */
const API_URL = 'http://localhost:8002/api/v1/students';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ INTERCEPTOR ROBUSTO
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    // Debug: Verifica en la consola si el token existe
    if (!token) {
        console.warn('⚠️ [StudentService] No se encontró token en localStorage');
    } else {
        // Aseguramos que headers exista
        if (!config.headers) {
            config.headers = {} as any;
        }
        // Asignación directa y segura
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* =========================
   PERFIL DEL ESTUDIANTE
========================= */
export const getStudentProfile = async (): Promise<StudentProfile> => {
  try {
    const response = await api.get<StudentProfile>('/me');
    return response.data;
  } catch (error) {
    // Si es 404, relanzamos el error para que el componente (Dashboard) lo maneje
    // y redirija a "Crear Perfil" o muestre un modal.
    console.error('Error obteniendo perfil de estudiante:', error);
    throw error;
  }
};

export const updateStudentProfile = async (
  data: Partial<StudentProfile>
): Promise<StudentProfile> => {
  try {
    const response = await api.put<StudentProfile>('/me', data);
    return response.data;
  } catch (error) {
    console.error('Error actualizando perfil de estudiante:', error);
    throw error;
  }
};

/* =========================
   RUTAS PERSONALIZADAS
========================= */
export const getCustomRoutes = async (): Promise<CustomRoute[]> => {
  try {
    const response = await api.get<CustomRoute[]>('/me/custom-routes');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo rutas personalizadas:', error);
    return [];
  }
};

export const createCustomRoute = async (
  data: CreateCustomRoutePayload
): Promise<CustomRoute> => {
  try {
    const response = await api.post<CustomRoute>('/me/custom-routes', data);
    return response.data;
  } catch (error) {
    console.error('Error creando ruta personalizada:', error);
    throw error;
  }
};

export const updateCustomRoute = async (
  id: string,
  data: Partial<CreateCustomRoutePayload>
): Promise<CustomRoute> => {
  try {
    const response = await api.put<CustomRoute>(`/me/custom-routes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error actualizando ruta personalizada:', error);
    throw error;
  }
};

export const deleteCustomRoute = async (id: string): Promise<void> => {
  try {
    await api.delete(`/me/custom-routes/${id}`);
  } catch (error) {
    console.error('Error eliminando ruta personalizada:', error);
    throw error;
  }
};