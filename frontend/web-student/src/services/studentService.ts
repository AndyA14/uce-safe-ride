import axios, { InternalAxiosRequestConfig } from 'axios';
import { CustomRoute, CreateCustomRoutePayload } from '@/types/route';

/* =========================
   TIPOS
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
   CONFIG AXIOS
========================= */
const API_URL = import.meta.env.VITE_STUDENT_SERVICE_URL || 'http://localhost:8002/api/v1/students';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ INTERCEPTOR ROBUSTO
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ [StudentService] No se encontró token en localStorage');
    } else {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ [StudentService] Token agregado al request');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Interceptor de respuesta para logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ [StudentService] Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ [StudentService] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

/* =========================
   PERFIL DEL ESTUDIANTE
========================= */
export const getStudentProfile = async (): Promise<StudentProfile> => {
  try {
    console.log('📚 [StudentService] Obteniendo perfil de estudiante...');
    const response = await api.get<StudentProfile>('/me');
    console.log('✅ [StudentService] Perfil obtenido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [StudentService] Error obteniendo perfil:', error);
    throw error;
  }
};

export const updateStudentProfile = async (
  data: StudentProfileUpdate
): Promise<StudentProfile> => {
  try {
    console.log('📝 [StudentService] Actualizando perfil:', data);
    
    // ✅ Enviar solo los campos que se pueden actualizar
    const updatePayload: StudentProfileUpdate = {};
    
    if (data.full_name !== undefined) updatePayload.full_name = data.full_name;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.career !== undefined) updatePayload.career = data.career;
    if (data.semester !== undefined) updatePayload.semester = data.semester;
    
    console.log('📦 [StudentService] Payload a enviar:', updatePayload);
    
    const response = await api.put<StudentProfile>('/me', updatePayload);
    console.log('✅ [StudentService] Perfil actualizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [StudentService] Error actualizando perfil:', error);
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