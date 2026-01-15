import axios, { InternalAxiosRequestConfig } from 'axios';
import { StudentProfile, Vehicle } from '@/types/transport';

/* =========================
   CONFIG AXIOS - VEHICLE SERVICE
========================= */
const VEHICLE_API_URL =
  import.meta.env.VITE_VEHICLE_SERVICE_URL || 'http://localhost:8004/api/v1/vehicles';

console.log('🔧 [VehicleService] VEHICLE_API_URL:', VEHICLE_API_URL);

const vehicleApi = axios.create({
  baseURL: VEHICLE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ INTERCEPTOR: Agregar token JWT
vehicleApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) config.headers = {} as any;
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ [VehicleService] Token agregado:', token.substring(0, 30) + '...');
    } else {
      console.warn('⚠️ [VehicleService] No se encontró token en localStorage');
    }
    const fullURL = `${config.baseURL}${config.url}`;
    console.log('🌐 [VehicleService] Request:', config.method?.toUpperCase(), fullURL);
    return config;
  },
  (error) => Promise.reject(error)
);

vehicleApi.interceptors.response.use(
  (response) => {
    console.log('✅ [VehicleService] Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ [VehicleService] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

/* =========================
   STUDENT SERVICE API
========================= */
const STUDENT_API_URL =
  import.meta.env.VITE_STUDENT_SERVICE_URL || 'http://localhost:8002/api/v1/students';

console.log('🔧 [StudentService] STUDENT_API_URL:', STUDENT_API_URL);

const studentApi = axios.create({
  baseURL: STUDENT_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

studentApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) config.headers = {} as any;
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ [StudentService] Token agregado');
    } else {
      console.warn('⚠️ [StudentService] Sin token');
    }
    const fullURL = `${config.baseURL}${config.url}`;
    console.log('🌐 [StudentService] Request:', config.method?.toUpperCase(), fullURL);
    return config;
  },
  (error) => Promise.reject(error)
);

studentApi.interceptors.response.use(
  (response) => {
    console.log('✅ [StudentService] Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ [StudentService] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

/* =========================
   SERVICIO DE TRANSPORTE
========================= */
export const transportService = {
  /**
   * 1️⃣ Obtener el perfil del estudiante autenticado
   */
  getMyProfile: async (): Promise<StudentProfile> => {
    try {
      console.log('📋 [TransportService] Obteniendo perfil de estudiante...');
      const response = await studentApi.get<StudentProfile>('/me');
      return response.data;
    } catch (error: any) {
      console.error('❌ [TransportService] Error obteniendo perfil:', error);
      throw error;
    }
  },

  /**
   * 2️⃣ Obtener MI vehículo usando el JWT
   */
  getMyVehicle: async (): Promise<Vehicle | null> => {
    try {
      console.log('🚌 [TransportService] Obteniendo mi vehículo...');
      const response = await vehicleApi.get<Vehicle>('/student/me');
      return response.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('ℹ️ [TransportService] Sin vehículo asignado');
        return null;
      }
      console.error('❌ [TransportService] Error obteniendo mi vehículo:', error);
      return null;
    }
  },

  /**
   * 3️⃣ Subirse a un bus
   */
  joinVehicle: async (vehicleId: string) => {
    try {
      console.log('🚀 [TransportService] Subiendo al vehículo:', vehicleId);
      const response = await vehicleApi.post(`/${vehicleId}/board`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TransportService] Error al subir al vehículo:', error);
      throw error;
    }
  },

  /**
   * 4️⃣ Bajarse del bus
   */
  leaveVehicle: async (vehicleId: string) => {
    try {
      console.log('🛑 [TransportService] Bajándose del vehículo:', vehicleId);
      const response = await vehicleApi.post(`/${vehicleId}/leave`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TransportService] Error al bajarse del vehículo:', error);
      throw error;
    }
  },

  /**
   * 5️⃣ Obtener todos los buses disponibles
   */
  getAllVehicles: async (): Promise<Vehicle[]> => {
    try {
      console.log('📋 [TransportService] Obteniendo todos los vehículos...');
      const response = await vehicleApi.get<Vehicle[]>('/');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ [TransportService] Error obteniendo vehículos:', error);
      return [];
    }
  },
};

export default transportService;
