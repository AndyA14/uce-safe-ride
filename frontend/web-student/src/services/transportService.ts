import { StudentProfile, Vehicle } from '@/types/transport';
import axios from 'axios';

/**
 * Servicio de Transporte
 * Maneja perfil del estudiante, buses y asignaciones
 */
export const transportService = {
  /**
   * 1️⃣ Obtener el perfil del estudiante autenticado
   */
  getMyProfile: async (): Promise<StudentProfile> => {
    const response = await axios.get<StudentProfile>('/students/me');
    return response.data;
  },

  /**
   * 2️⃣ Obtener el vehículo asignado al estudiante
   * El backend devuelve una lista → tomamos el primero
   */
  getMyTransport: async (studentId: string): Promise<Vehicle | null> => {
    try {
      const response = await axios.get<Vehicle[]>(
        `/vehicles/student/${studentId}`
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo transporte del estudiante:', error);
      return null;
    }
  },

  /**
   * 3️⃣ Subirse a un bus
   * POST /vehicles/{id}/board
   */
  joinVehicle: async (vehicleId: string) => {
    const response = await axios.post(
      `/vehicles/${vehicleId}/board`
    );
    return response.data;
  },

  /**
   * 4️⃣ Obtener todos los buses disponibles (Rutas)
   * 🛡️ NUNCA rompe el frontend
   */
  getAllVehicles: async (): Promise<Vehicle[]> => {
    try {
      const response = await axios.get<Vehicle[]>('/vehicles');

      // 🛡️ Doble verificación
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error obteniendo vehículos:', error);
      return []; 
    }
  }
};
