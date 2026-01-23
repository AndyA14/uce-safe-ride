import axios from 'axios';

/* ======================================================
   CONFIGURACIÓN - Vehicle Service (Puerto 8004)
====================================================== */
const VEHICLE_API_URL = 'http://localhost:8004/api/v1/vehicles';

const vehicleApi = axios.create({
  baseURL: VEHICLE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor JWT
vehicleApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ======================================================
   TYPES
====================================================== */
export interface Vehicle {
  id: string;
  plate: string;
  model?: string;
  capacity?: number;
  driver_id?: string | null;  // ← Driver ID interno (no Auth ID)
  status?: string;
}

/* ======================================================
   SERVICE
====================================================== */
export const vehicleService = {
  /**
   * 🔑 Obtiene el vehículo asignado al conductor
   * @param driverId - Driver ID interno (NO el Auth User ID)
   */
  getVehicleByDriver: async (driverId: string): Promise<Vehicle | null> => {
    try {
      console.log(`🚌 Buscando vehículo para driver_id: ${driverId}`);
      
      const response = await vehicleApi.get('/');
      const vehicles: Vehicle[] = response.data;

      // Buscar el vehículo que pertenece a este conductor
      const vehicle = vehicles.find((v) => v.driver_id === driverId);

      if (vehicle) {
        console.log(`✅ Vehículo encontrado: ${vehicle.plate}`);
      } else {
        console.log('⚠️ No hay vehículo asignado a este conductor');
      }

      return vehicle || null;
    } catch (error: any) {
      console.error('❌ Error en vehicleService.getVehicleByDriver:', error.response?.status);
      return null;
    }
  },

  /**
   * Lista todos los vehículos
   */
  getAllVehicles: async (): Promise<Vehicle[]> => {
    try {
      const response = await vehicleApi.get('/');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo vehículos:', error);
      return [];
    }
  },

  /**
   * Reclama (asigna) un vehículo al conductor actual
   */
  claimVehicle: async (vehicleId: string) => {
    try {
      console.log(`🔑 Reclamando vehículo: ${vehicleId}`);
      const response = await vehicleApi.post(`/${vehicleId}/claim`);
      console.log('✅ Vehículo reclamado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error reclamando vehículo:', error);
      throw error;
    }
  },

  /**
   * Libera un vehículo (remueve asignación)
   */
  releaseVehicle: async (vehicleId: string) => {
    try {
      const response = await vehicleApi.post(`/${vehicleId}/release`);
      return response.data;
    } catch (error) {
      console.error('❌ Error liberando vehículo:', error);
      throw error;
    }
  },
};

export default vehicleService;