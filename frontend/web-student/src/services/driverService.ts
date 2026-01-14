import axios from 'axios';

/* =========================
   TIPOS
========================= */
export interface DriverProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  license_number?: string;
  phone?: string;
  ci?: string;
  status?: string;
}

/* =========================
   CONFIG AXIOS  
========================= */
const API_URL = import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:8005/api/v1/drivers';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Interceptor para Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('⚠️ [DriverService] No se encontró token en localStorage');
  } else {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [DriverService] Token agregado al request');
    }
  }
  
  return config;
});

// ✅ Interceptor de respuesta para logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ [DriverService] Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ [DriverService] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

/* =========================
   OBTENER PERFIL
========================= */
export const getDriverProfile = async (): Promise<DriverProfile> => {
  try {
    console.log('🚗 [DriverService] Obteniendo perfil de conductor...');
    const response = await api.get<DriverProfile>('/me');
    console.log('✅ [DriverService] Perfil obtenido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [DriverService] Error obteniendo perfil:', error);
    throw error;
  }
};