import axios from 'axios';

// Usamos localhost explícito.
const TRIP_API_URL = 'http://localhost:8010/api/v1/trips';

const tripApi = axios.create({
  baseURL: TRIP_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

tripApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalizador: Extrae el array de donde sea que venga
const normalizeData = (data: any) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data)) return data.data; // Por si acaso
  return [];
};

export const transportService = {
  // 1. Obtener viaje activo
  getActiveTripByStudent: async (studentId: string) => {
    if (!studentId || studentId === 'unknown') return null;
    try {
      console.log(`📡 [SERVICE] Buscando viaje activo para: ${studentId}`);
      const response = await tripApi.get('/', {
        params: { student_id: studentId, status: 'ACTIVE' }
      });
      const items = normalizeData(response.data);
      console.log('✅ [SERVICE] Viaje encontrado:', items[0]);
      return items[0] || null;
    } catch (err) {
      console.error('❌ [SERVICE] Error buscando viaje:', err);
      return null;
    }
  },

  // 2. Listar viajes disponibles
  getActiveTrips: async () => {
    try {
      console.log('📡 [SERVICE] Solicitando lista de viajes al puerto 8010...');
      const response = await tripApi.get('/', {
        params: { status: 'ACTIVE' }
      });
      const data = normalizeData(response.data);
      console.log(`✅ [SERVICE] ${data.length} viajes recibidos.`);
      return data;
    } catch (err) {
      console.error('❌ [SERVICE] Error listando viajes:', err);
      return [];
    }
  },

  // 3. Subirse (POST)
  boardTrip: async (tripId: number, studentId: string) => {
    const response = await tripApi.post(`/${tripId}/passengers`, {
      student_id: String(studentId),
      fare_amount: 0.25,
      stop_id: null,
    });
    return response.data;
  },

  // 4. Bajarse (DELETE) con reason
  leaveVehicle: async (tripId: number | string, studentId: string) => {
    const response = await tripApi.delete(`/${tripId}/passengers/${studentId}`, {
      params: { reason: "Descenso estudiante" }
    });
    return response.data;
  }
};