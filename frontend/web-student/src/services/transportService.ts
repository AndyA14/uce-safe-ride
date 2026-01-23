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
  // MÉTODOS PARA CONDUCTORES
  // -------------------------
  
  getActiveTripByDriver: async (driverId: string) => {
    if (!driverId) return null;
    try {
      const response = await tripApi.get('/', { params: { driver_id: driverId } });
      const trips = normalizeData(response.data);
      return trips.find((t: any) => t.status !== 'COMPLETED') || null;
    } catch (err) {
      console.error('[SERVICE] Error buscando viaje del conductor:', err);
      return null;
    }
  },

  createTrip: async (data: { route_id: string; vehicle_id: string; driver_id: string }) => {
    const response = await tripApi.post('/', { ...data, status: 'CREATED' });
    return response.data;
  },

  startTrip: async (tripId: number) => {
    const response = await tripApi.patch(`/${tripId}`, {
      status: 'ACTIVE',
      start_time: new Date().toISOString(),
    });
    return response.data;
  },

  // -------------------------
  // Método para actualizar el estado de un viaje como completado
  // -------------------------
  completeTrip: async (tripId: number) => {
    const response = await tripApi.patch(`/${tripId}`, { 
      status: 'COMPLETED' // ✅ Sincronizado con TripStatus.COMPLETED
    });
    return response.data;
  },

  // -------------------------
  // NUEVO MÉTODO: Historial de viajes del conductor
  // -------------------------
  getDriverHistory: async (driverId: string) => {
    if (!driverId) return [];
    try {
      const response = await tripApi.get('/', {
        params: { driver_id: driverId, status: 'COMPLETED' } // ✅ Sincronizado con TripStatus.COMPLETED
      });
      return normalizeData(response.data);
    } catch (error: any) {
      console.error('❌ Error obteniendo historial:', error.message);
      return []; // Retornamos un array vacío para evitar que la UI falle
    }
  }
};

export default transportService;
