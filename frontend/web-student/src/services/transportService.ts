import axios from 'axios';

/* ======================================================
   BASE URLS
====================================================== */

/**
 * 🌐 Microservicio de Trips
 */
const TRIP_API_URL = 'http://127.0.0.1:8010/api/v1/trips';

/**
 * 🌐 Microservicio de Routes (Fuente de la Verdad)
 * 👉 En producción esto debe apuntar al API Gateway
 */
const ROUTES_API_URL = 'http://localhost:8003/api/v1/routes';

/* ======================================================
   AXIOS INSTANCE (Trips)
====================================================== */
const tripApi = axios.create({
  baseURL: TRIP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

/**
 * 🔐 Interceptor JWT
 */
tripApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ======================================================
   HELPERS
====================================================== */

/**
 * 🧹 Normalizador de respuestas
 */
const normalizeData = (data: any) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

/* ======================================================
   SERVICE
====================================================== */

export const transportService = {
  /**
   * 1️⃣ Obtener viaje activo del estudiante
   */
  getActiveTripByStudent: async (studentId: string) => {
    if (!studentId || studentId === 'unknown') return null;

    try {
      console.log('📡 Consultando mis viajes activos...');

      const myTripsResponse = await tripApi.get('/students/me/trips', {
        params: { active_only: true },
      });

      const myTrips = normalizeData(myTripsResponse.data);

      if (myTrips.length === 0) {
        console.log('✨ No tienes viajes activos');
        return null;
      }

      const passengerRecord = myTrips[0];
      const tripId = passengerRecord.trip_id;

      console.log(`✅ Viaje activo encontrado: ${tripId}`);

      const allTrips = await transportService.getActiveTrips();
      return allTrips.find((t: any) => t.id === tripId) || null;

    } catch (error) {
      console.error('❌ Error buscando viaje personal:', error);
      return null;
    }
  },

  /**
   * 2️⃣ Listar viajes activos
   */
  getActiveTrips: async () => {
    try {
      console.log('📡 Consultando viajes activos...');

      const response = await tripApi.get('/', {
        params: { status: 'ACTIVE' },
      });

      const data = normalizeData(response.data);
      console.log('✅ Viajes activos recibidos:', data);

      return data;
    } catch (error) {
      console.error('❌ Error listando viajes:', error);
      return [];
    }
  },

  /**
   * 3️⃣ Subirse al vehículo
   */
  boardTrip: async (tripId: number, studentId: string) => {
    if (!studentId || studentId === 'unknown') {
      throw new Error('Usuario no identificado');
    }

    const payload = {
      student_id: String(studentId),
      fare_amount: 0.25,
      stop_id: null,
    };

    try {
      console.log(`🚌 Abordando viaje ${tripId}`);
      const response = await tripApi.post(`/${tripId}/passengers`, payload);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al abordar:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * 4️⃣ Bajarse del vehículo
   */
  leaveVehicle: async (tripId: number | string, studentId: string) => {
    if (!studentId || studentId === 'unknown') {
      throw new Error('Usuario no identificado');
    }

    try {
      console.log(`🚪 Bajando del viaje ${tripId}`);

      const response = await tripApi.delete(
        `/${tripId}/passengers/${studentId}`,
        {
          params: { reason: 'Descenso normal del estudiante' },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error al bajar:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * 5️⃣ 🏗️ PRODUCCIÓN
   * Obtener la polilínea de la ruta desde la Fuente de la Verdad
   * ✅ CORREGIDO: petición directa a la ruta específica
   */
  getRoutePolyline: async (routeId: string) => {
    if (!routeId) return null;

    try {
      console.log(`🗺️ Buscando polilínea para ruta ${routeId}`);

      // 🟢 PETICIÓN DIRECTA A /routes/{id}
      const response = await axios.get(`${ROUTES_API_URL}/${routeId}`);
      const route = response.data;

      if (route?.polyline) {
        console.log(`✅ Ruta encontrada: ${route.name}`);
        return route.polyline;
      }

      console.warn('⚠️ Ruta encontrada pero sin polyline');
      return null;

    } catch (error) {
      console.error('❌ Error obteniendo ruta maestra:', error);
      return null;
    }
  },
};

export default transportService;
