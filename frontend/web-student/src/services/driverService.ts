import axios from 'axios';

/* =========================
   TIPOS
========================= */
export interface DriverProfile {
  id: string;
  auth_user_id?: string;   // Opcional si tu backend no lo devuelve
  name: string;            // CORRECCIÓN: el backend usa 'name'
  email?: string;
  phone?: string;
  license_number?: string;
  ci?: string;
  status?: string;
}

/* =========================
   CONFIG AXIOS  
========================= */
const API_URL =
  import.meta.env.VITE_DRIVER_SERVICE_URL || 'http://localhost:8005/api/v1/drivers';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Interceptor para token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ [DriverService] Token agregado al request');
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
   FUNCIONES INDIVIDUALES
========================= */

/**
 * 1️⃣ Obtener un conductor por su ID
 * @param driverId - UUID del conductor
 */
export const getDriverById = async (driverId: string): Promise<DriverProfile | null> => {
  try {
    console.log(`🚗 [DriverService] Obteniendo conductor con ID ${driverId}...`);
    const response = await api.get<DriverProfile>(`/${driverId}`);
    console.log('✅ [DriverService] Conductor obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.warn('❌ [DriverService] No se pudo cargar info del conductor', error);
    return null;
  }
};

/**
 * 2️⃣ Obtener perfil del conductor actual (/me)
 */
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

/**
 * 3️⃣ Actualizar perfil del conductor (/me)
 */
export const updateDriverProfile = async (data: Partial<DriverProfile>): Promise<DriverProfile> => {
  try {
    console.log('🚗 [DriverService] Actualizando perfil de conductor...');
    const response = await api.put<DriverProfile>('/me', data);
    console.log('✅ [DriverService] Perfil actualizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [DriverService] Error actualizando perfil:', error);
    throw error;
  }
};

/* =========================
   OBJETO driverService (opcional)
========================= */
export const driverService = {
  getDriverById,
  getDriverProfile,
  updateDriverProfile,
};
