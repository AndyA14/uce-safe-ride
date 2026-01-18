import axios from 'axios';
import { Route } from '@/types/route'; // Asumiendo que tienes los tipos definidos
import { BusStop, Bus } from '@/types/user'; // Asumiendo tipos de paradas y buses

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003/api/v1/routes';

const UI_COLORS = ['#0033A0', '#22C55E', '#FFC400', '#EF4444', '#8B5CF6'];

// Interfaz de la respuesta para la ruta activa
export interface ActiveRouteResponse {
  route_id: string;
  status: string; // 'active', etc.
}

/**
 * Obtiene la ruta activa del estudiante o conductor logueado.
 */
export const getActiveRoute = async (token: string): Promise<ActiveRouteResponse | null> => {
  try {
    const response = await axios.get<ActiveRouteResponse>(`${API_URL}/active/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null; // No se encuentra una ruta activa
    }
    console.error('Error verificando ruta activa:', error);
    throw error;
  }
};

/**
 * Obtiene todas las rutas disponibles y las adapta para la UI
 */
export const getRoutes = async (): Promise<Route[]> => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.get<any[]>(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.map((backendRoute, index) => ({
      id: backendRoute.id,
      name: backendRoute.name,
      direction: backendRoute.direction || 'Circular', 
      active: backendRoute.active !== undefined ? backendRoute.active : true,
      color: UI_COLORS[index % UI_COLORS.length], // Asignación de color para UI
      activeBuses: Math.floor(Math.random() * 5) + 1, // Simulación de cantidad de buses activos
      totalStops: 8, // Simulación de número de paradas
    }));
  } catch (error) {
    console.error('Error conectando con microservicio de rutas:', error);
    return [];
  }
};

/**
 * Obtiene los detalles de una ruta específica por su ID
 */
export const getRouteById = async (id: string): Promise<Route | null> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      id: response.data.id,
      name: response.data.name,
      direction: response.data.direction || 'Circular',
      active: response.data.active,
      color: '#0033A0',
      activeBuses: 3, // Simulación
      totalStops: 8 // Simulación
    };
  } catch (error) {
    console.error(`Error obteniendo ruta ${id}:`, error);
    return null;
  }
};

/**
 * Obtiene las paradas asociadas a una ruta específica
 */
export const getRouteStops = async (routeId: string): Promise<BusStop[]> => {
  const mockStops: BusStop[] = [
    { id: '1', name: 'Facultad de Medicina', studentsWaiting: 8, estimatedArrival: '2 min' },
    { id: '2', name: 'Biblioteca Central', studentsWaiting: 5, estimatedArrival: '7 min' },
  ];
  return new Promise((resolve) => setTimeout(() => resolve(mockStops), 300));
};

/**
 * Obtiene los buses activos asociados a una ruta específica
 */
export const getRouteBuses = async (routeId: string): Promise<Bus[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([]), 300)); // Simulación de buses
};

/**
 * Obtiene las paradas cercanas a una ubicación geográfica
 */
export const getNearbyStops = async (latitude: number, longitude: number): Promise<BusStop[]> => {
  const mockStops: BusStop[] = [
    { id: '1', name: 'Facultad de Medicina', studentsWaiting: 8, estimatedArrival: '2 min' },
    { id: '2', name: 'Biblioteca Central', studentsWaiting: 5, estimatedArrival: '7 min' },
  ];
  return new Promise((resolve) => setTimeout(() => resolve(mockStops), 500));
};

/**
 * Obtiene la ubicación de un bus específico
 */
export const getBusLocation = async (busId: string): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => setTimeout(() => resolve({ lat: -0.2105, lng: -78.4917 }), 300));
};
