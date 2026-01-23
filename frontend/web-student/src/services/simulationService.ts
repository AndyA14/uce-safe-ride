import axios from 'axios';

const SIM_API_URL = 'http://localhost:8011';

const simulationApi = axios.create({
  baseURL: SIM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

simulationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface StartSimulationRequest {
  trip_id: number | string;
  route_id: string;
  driver_id: string;
}

export interface StopSimulationRequest {
  trip_id: number | string;
}

export interface SimulationStatus {
  active: boolean;
  trip_id?: number | string;
  progress?: number;
}

export const simulationService = {
  /**
   * Inicia la simulación para un viaje específico.
   * Acepta un solo objeto con los parámetros correctos.
   */
  start: async ({ trip_id, route_id, driver_id }: StartSimulationRequest) => {
    try {
      console.log('🚀 Iniciando simulación:', {
        trip_id,
        route_id,
        driver_id,
      });

      const response = await simulationApi.post('/simulation/start', {
        trip_id,
        route_id,
        driver_id,
      });

      console.log('✅ Simulación iniciada exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error iniciando simulación:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Detiene la simulación de un viaje.
   * Solo se necesita el trip_id.
   */
  stop: async (tripId: number | string) => {
    try {
      console.log('🛑 Deteniendo simulación del viaje:', tripId);

      const response = await simulationApi.post('/simulation/stop', {
        trip_id: tripId,
      });

      console.log('✅ Simulación detenida exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deteniendo simulación:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtiene todas las simulaciones activas.
   */
  getActiveSimulations: async () => {
    try {
      const response = await simulationApi.get('/simulation/active');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo simulaciones activas:', error);
      return [];
    }
  },

  /**
   * Verifica si hay una simulación activa para un viaje específico.
   */
  isSimulationActive: async (tripId: number | string): Promise<boolean> => {
    try {
      const response = await simulationApi.get(`/simulation/status/${tripId}`);
      return response.data?.active || false;
    } catch (error) {
      return false;
    }
  },
};

export default simulationService;
