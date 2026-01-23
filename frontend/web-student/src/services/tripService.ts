import axios from 'axios';

/* ======================================================
   CONFIGURACIÓN BASE
====================================================== */
const TRIP_API_URL = 'http://localhost:8010/api/v1/trips';
const ROUTES_API_URL = 'http://localhost:8003/api/v1/routes';

const tripApi = axios.create({
  baseURL: TRIP_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

/* JWT Interceptor */
tripApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* Normalizador de respuestas */
const normalizeData = (data: any) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

/* ======================================================
   TRANSPORT SERVICE
====================================================== */
export const transportService = {
  // -------------------------
  // MÉTODOS PARA ESTUDIANTES
  // -------------------------
  getActiveTripByStudent: async (studentId: string) => {
    if (!studentId || studentId === 'unknown') return null;
    try {
      console.log(`[SERVICE] Buscando viaje activo para estudiante: ${studentId}`);
      const response = await tripApi.get('/', {
        params: { student_id: studentId, status: 'ACTIVE' },
      });
      const trips = normalizeData(response.data);
      console.log(`[SERVICE] Viaje encontrado:`, trips[0] || 'Ninguno');
      return trips[0] || null;
    } catch (err) {
      console.error('[SERVICE] Error buscando viaje de estudiante:', err);
      return null;
    }
  },

  boardTrip: async (tripId: number, studentId: string) => {
    const response = await tripApi.post(`/${tripId}/passengers`, {
      student_id: String(studentId),
      fare_amount: 0.25,
      stop_id: null,
    });
    return response.data;
  },

  leaveVehicle: async (tripId: number | string, studentId: string) => {
    const response = await tripApi.delete(`/${tripId}/passengers/${studentId}`, {
      params: { reason: "Descenso estudiante" },
    });
    return response.data;
  },

  getActiveTrips: async () => {
    try {
      const response = await tripApi.get('/', { params: { status: 'ACTIVE' } });
      const trips = normalizeData(response.data);
      console.log(`[SERVICE] Viajes activos: ${trips.length}`);
      return trips;
    } catch (err) {
      console.error('[SERVICE] Error listando viajes activos:', err);
      return [];
    }
  },

  getRoutePolyline: async (routeId: string) => {
    if (!routeId) return null;
    try {
      const response = await axios.get(`${ROUTES_API_URL}/${routeId}`);
      return response.data?.polyline || null;
    } catch (err) {
      console.error('[SERVICE] Error obteniendo polyline de ruta:', err);
      return null;
    }
  },

  // -------------------------
  // NUEVO MÉTODO: Obtener viajes por ruta
  // -------------------------
  getTripsByRoute: async (routeId: string) => {
    // Ajusta la URL según cómo esté definido en tu Backend Trip Service.
    // Opción 1 (Query param):
    const response = await tripApi.get('/', {
      params: { route_id: routeId },
    });
    
    // Opción 2 (Ruta directa):
    // const response = await tripApi.get(`/route/${routeId}`);
    
    return response.data ? normalizeData(response.data) : [];
  },
  
  // -------------------------
  // MÉTODOS PARA CONDUCTORES
  // -------------------------
  getActiveTripByDriver: async (driverId: string) => {
    if (!driverId) return null;
    try {
      const response = await tripApi.get('/', { params: { driver_id: driverId } });
      const trips = normalizeData(response.data);
      return trips.find((t: any) => t.status !== 'CREATED') || null;
    } catch (err) {
      console.error('[SERVICE] Error buscando viaje del conductor:', err);
      return null;
    }
  },

  // -------------------------
  // MÉTODOS PARA VIAJE
  // -------------------------
  createTrip: async (data: { route_id: string; vehicle_id: string; driver_id: string }) => {
    // Añadimos scheduled_start_time porque el backend lo pide como obligatorio (nullable=False)
    const payload = {
      ...data,
      status: 'CREATED',
      scheduled_start_time: new Date().toISOString(), // Fecha actual como inicio programado
      max_passengers: 40, // Valor por defecto para evitar otros 422
    };

    try {
      const response = await tripApi.post('/', payload); // Usamos POST para crear el viaje
      return response.data;
    } catch (error) {
      console.error('Error al crear el viaje:', error.response?.data || error.message);
      throw error; // Vuelve a lanzar el error para que el componente que llama a esta función lo maneje
    }
  },

  startTrip: async (tripId: number) => {
    // El backend espera POST para iniciar el viaje, sin cuerpo adicional
    try {
      const response = await tripApi.post(`/${tripId}/start`, {}); // Enviamos un objeto vacío en el body
      return response.data;
    } catch (error) {
      console.error('Error al iniciar el viaje:', error.response?.data || error.message);
      throw error;
    }
  },

  completeTrip: async (tripId: number) => {
    // El backend espera POST para completar el viaje, sin cuerpo adicional
    try {
      const response = await tripApi.post(`/${tripId}/complete`, {}); // Enviamos un objeto vacío en el body
      return response.data;
    } catch (error) {
      console.error('Error al completar el viaje:', error.response?.data || error.message);
      throw error;
    }
  },

  // -------------------------
  // NUEVO MÉTODO: Historial de viajes del conductor
  // -------------------------
  getDriverHistory: async (driverId: string) => {
    if (!driverId) return [];
    try {
      const response = await tripApi.get('/', {
        params: { driver_id: driverId, status: 'COMPLETED' },
      });
      return response.data ? normalizeData(response.data) : [];
    } catch (error: any) {
      console.error('❌ Error en el servidor de viajes:', error.response?.status);
      return [];
    }
  },
};

export default transportService;
