import axios from 'axios';

/* ======================================================
   CONFIGURACIÓN - Driver Service (Puerto 8005)
====================================================== */
const DRIVER_API_URL = 'http://localhost:8005/api/v1';

const driverHttp = axios.create({
  baseURL: DRIVER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para JWT automático
driverHttp.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================================================
   TYPES
====================================================== */
export interface DriverProfile {
  id: string;              // ← Driver ID interno (para servicios de negocio)
  user_id: string;         // ← Auth User ID (del token)
  name: string;
  email: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DriverProfileUpdate {
  name?: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
}

/* ======================================================
   SERVICE
====================================================== */
export const driverService = {
  /**
   * 🔑 MÉTODO CRÍTICO: Obtiene el perfil del conductor actual
   * Endpoint: GET /api/v1/drivers/me
   * 
   * Este método resuelve el mapeo: Auth User ID → Driver ID
   */
  getDriverProfile: async (): Promise<DriverProfile> => {
    try {
      console.log('='.repeat(60));
      console.log('🔍 OBTENIENDO PERFIL DE CONDUCTOR');
      console.log('='.repeat(60));
      console.log('Endpoint: GET /api/v1/drivers/me');
      console.log('Puerto: 8005');

      const response = await driverHttp.get<DriverProfile>('/drivers/me');

      console.log('✅ Perfil recibido:', {
        driver_id: response.data.id,
        auth_user_id: response.data.user_id,
        name: response.data.name,
        email: response.data.email,
      });
      console.log('='.repeat(60));

      return response.data;
    } catch (error: any) {
      console.error('='.repeat(60));
      console.error('❌ ERROR OBTENIENDO PERFIL DE CONDUCTOR');
      console.error('='.repeat(60));
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        console.error('Sin respuesta del servidor');
        console.error('¿Está corriendo el Driver Service en puerto 8005?');
      } else {
        console.error('Error:', error.message);
      }
      console.error('='.repeat(60));
      
      throw error;
    }
  },

  /**
   * Actualiza el perfil del conductor
   */
  updateDriverProfile: async (
    data: DriverProfileUpdate
  ): Promise<DriverProfile> => {
    try {
      console.log('📝 Actualizando perfil de conductor...');
      
      const response = await driverHttp.put<DriverProfile>(
        '/drivers/me',
        data
      );

      console.log('✅ Perfil actualizado');
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  },

  /**
   * Obtiene el historial de viajes del conductor
   */
  getDriverHistory: async (driverId: string) => {
    try {
      console.log(`📜 Obteniendo historial del conductor ${driverId}...`);
      
      const response = await driverHttp.get(`/drivers/${driverId}/trips`);
      
      console.log(`✅ Historial obtenido: ${response.data.length} viajes`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      return [];
    }
  },

  /**
   * Obtiene estadísticas del conductor
   */
  getDriverStats: async (driverId: string) => {
    try {
      const response = await driverHttp.get(`/drivers/${driverId}/stats`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  },
};

export default driverService;
