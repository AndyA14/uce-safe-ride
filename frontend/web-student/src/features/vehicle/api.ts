import { http } from '../../shared/http';
import type { Vehicle } from './types';

export async function getMyVehicle(): Promise<Vehicle> {
  const res = await http.get('/api/v1/vehicles/me');
  return res.data;
}
