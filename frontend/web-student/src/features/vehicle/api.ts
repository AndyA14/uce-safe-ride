import { studentHttp } from '@/core/http';
import type { Vehicle } from './types';

/**
 * Obtiene los vehículos asignados al estudiante actual
 * Endpoint: GET /students/me/vehicles
 */
export const getMyVehicles = async (): Promise<Vehicle[]> => {
  const res = await studentHttp.get<Vehicle[]>('/students/me/vehicles');
  return res.data;
};
