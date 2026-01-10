// src/services/studentService.ts
import axios from 'axios';
import { StudentProfile } from '@/types/user';
import { CustomRoute, CreateCustomRoutePayload } from '@/types/route';

const API_URL = 'http://localhost:8002/api/v1/students';

// --- INSTANCIA DE AXIOS ---
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- INTERCEPTOR PARA AUTORIZACIÓN ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------
// PERFIL DEL ESTUDIANTE
// ----------------------------
export const getStudentProfile = async (): Promise<StudentProfile> => {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    throw error;
  }
};

export const updateStudentProfile = async (
  data: Partial<StudentProfile>
): Promise<StudentProfile> => {
  try {
    const response = await api.put('/me', data);
    return response.data;
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    throw error;
  }
};

// ----------------------------
// RUTAS PERSONALIZADAS DEL ESTUDIANTE
// ----------------------------
export const getCustomRoutes = async (): Promise<CustomRoute[]> => {
  try {
    const response = await api.get<CustomRoute[]>('/me/custom-routes');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo rutas personalizadas:', error);
    return []; // Retornamos array vacío para no romper la UI
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
