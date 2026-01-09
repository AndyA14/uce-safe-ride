import { routeHttp } from '@/core/http';
import type { Route } from './types';

/**
 * Obtiene todas las rutas disponibles
 * Endpoint: GET /routes
 */
export const getRoutes = async (): Promise<Route[]> => {
  const res = await routeHttp.get<Route[]>('/routes');
  return res.data;
};
