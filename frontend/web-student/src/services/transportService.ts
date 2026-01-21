import axios, { InternalAxiosRequestConfig } from 'axios';
import { StudentProfile, Vehicle } from '@/types/transport';

/* =========================
   CONFIG AXIOS - VEHICLE SERVICE
========================= */
const VEHICLE_API_URL =
  import.meta.env.VITE_VEHICLE_SERVICE_URL || 'http://localhost:8004/api/v1/vehicles';

const vehicleApi = axios.create({
  baseURL: VEHICLE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor Token Vehicle
vehicleApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) config.headers = {} as any;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   CONFIG AXIOS - STUDENT SERVICE
========================= */
const STUDENT_API_URL =
  import.meta.env.VITE_STUDENT_SERVICE_URL || 'http://localhost:8002/api/v1/students';

const studentApi = axios.create({
  baseURL: STUDENT_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor Token Student
studentApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) config.headers = {} as any;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   🟢 NUEVO: TRIP SERVICE API
========================= */
// Apuntamos al puerto 8010 que es el Trip Service
const TRIP_API_URL =
  import.meta.env.VITE_TRIP_SERVICE_URL || 'http://localhost:8010/api/v1/trips';

const tripApi = axios.create({
  baseURL: TRIP_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor Token Trip
tripApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) config.headers = {} as any;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   SERVICIO UNIFICADO
========================= */
export const transportService = {
  // 1️⃣ Perfil
  getMyProfile: async (): Promise<StudentProfile> => {
    const response = await studentApi.get<StudentProfile>('/me');
    return response.data;
  },

  // 2️⃣ Mi Vehículo (Viaje activo del estudiante)
  getMyVehicle: async (): Promise<Vehicle | null> => {
    try {
      // Nota: Idealmente deberíamos preguntar a TripService si el estudiante tiene un viaje activo
      // Pero mantenemos tu lógica actual de VehicleService por ahora si funciona para ti.
      const response = await vehicleApi.get<Vehicle>('/student/me');
      return response.data || null;
    } catch (error: any) {
      return null;
    }
  },

  // 3️⃣ Unirse
  joinVehicle: async (vehicleId: string) => {
    const response = await vehicleApi.post(`/${vehicleId}/board`);
    return response.data;
  },

  // 4️⃣ Bajarse
  leaveVehicle: async (vehicleId: string) => {
    const response = await vehicleApi.post(`/${vehicleId}/leave`);
    return response.data;
  },

  /**
   * 🟢 5️⃣ OBTENER VIAJES ACTIVOS
   * En lugar de traer todos los vehículos, traemos solo los viajes con status=ACTIVE
   */
  getActiveTrips: async () => {
    try {
      console.log('📡 Consultando viajes activos al Trip Service...');
      // Llamamos al endpoint GET /trips?status=ACTIVE
      const response = await tripApi.get('/', {
        params: { status: 'ACTIVE' }
      });
      
      // La respuesta es paginada: { items: [...], total: ... }
      // Devolvemos los items (los viajes)
      return response.data.items || [];
    } catch (error) {
      console.error('❌ Error obteniendo viajes activos:', error);
      return [];
    }
  },

  // Mantenemos este por compatibilidad, pero el frontend debería usar getActiveTrips
  getAllVehicles: async (): Promise<Vehicle[]> => {
    const response = await vehicleApi.get<Vehicle[]>('/');
    return Array.isArray(response.data) ? response.data : [];
  },
};

export default transportService;