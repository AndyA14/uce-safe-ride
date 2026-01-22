import axios from 'axios';

/**
 * 🌐 Base URL del microservicio de transporte
 */
const TRIP_API_URL = 'http://127.0.0.1:8010/api/v1/trips';

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

/**
 * 🧹 Normalizador de respuestas
 */
const normalizeData = (data: any) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

export const transportService = {
  /**
   * 1️⃣ Obtener viaje activo del estudiante
   * ✅ VERSIÓN FINAL: Consulta directa al endpoint "Mis Viajes"
   */
  getActiveTripByStudent: async (studentId: string) => {
    if (!studentId || studentId === 'unknown') return null;

    try {
      console.log(`📡 Consultando mis viajes activos en el Backend...`);

      // 1. Preguntamos al endpoint específico de "Mis Viajes"
      const myTripsResponse = await tripApi.get('/students/me/trips', {
        params: { active_only: true }
      });

      const myTrips = normalizeData(myTripsResponse.data);

      if (myTrips.length > 0) {
        // Tomamos el primero
        const myPassengerRecord = myTrips[0];
        const currentTripId = myPassengerRecord.trip_id;

        console.log(`✅ ¡Encontrado! Estás en el viaje ID: ${currentTripId}`);

        // 2. Traemos detalles completos de ese viaje
        const allTrips = await transportService.getActiveTrips();
        const fullTripDetails = allTrips.find((t: any) => t.id === currentTripId);

        return fullTripDetails || null;
      }

      console.log('✨ No tienes viajes activos actualmente.');
      return null;

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
      console.log('✅ Viajes recibidos:', data);

      return data;
    } catch (error) {
      console.error('❌ Error listando viajes:', error);
      return [];
    }
  },

  /**
   * 3️⃣ Subirse al vehículo (POST)
   */
  boardTrip: async (tripId: number, studentId: string) => {
    if (!studentId || studentId === 'unknown') {
      console.warn('⛔ Intento de abordar con usuario desconocido');
      throw new Error('Usuario no identificado. Recarga la página.');
    }

    const payload = {
      student_id: String(studentId),
      fare_amount: 0.25,
      stop_id: null,
    };

    try {
      console.log(`🚌 Abordando viaje ${tripId}`, payload);
      const response = await tripApi.post(`/${tripId}/passengers`, payload);
      console.log('✅ Abordaje exitoso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al abordar (Backend dice):', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  },

  /**
   * 4️⃣ Bajarse del vehículo (DELETE)
   */
  leaveVehicle: async (tripId: number | string, studentId: string) => {
    if (!studentId || studentId === 'unknown') {
      throw new Error('Usuario no identificado.');
    }

    try {
      console.log(`🚪 Bajando del viaje ${tripId}...`);

      const response = await tripApi.delete(`/${tripId}/passengers/${studentId}`, {
        params: { reason: 'Descenso normal del estudiante' },
      });

      console.log('✅ Descenso exitoso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al bajar (Backend dice):', JSON.stringify(error.response?.data || error.message, null, 2));
      throw error;
    }
  },
};

export default transportService;
