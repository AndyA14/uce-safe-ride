import axios from 'axios';
import { BusStop, Bus } from '@/types/user';
import { Route } from '@/types/route'; 

const API_URL = 'http://localhost:8003/api/v1/routes';


const UI_COLORS = ['#0033A0', '#22C55E', '#FFC400', '#EF4444', '#8B5CF6'];

/**
 * Obtiene todas las rutas y las adapta para la UI
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
      
      color: UI_COLORS[index % UI_COLORS.length], 
      activeBuses: Math.floor(Math.random() * 5) + 1, 
      totalStops: 8 
    }));

  } catch (error) {
    console.error('Error conectando con microservicio de rutas:', error);
    return [];
  }
};

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
      activeBuses: 3,
      totalStops: 8
    };
  } catch (error) {
    console.error(`Error obteniendo ruta ${id}:`, error);
    return null;
  }
};

// --- MOCKS (Igual que antes) ---

const mockStops: BusStop[] = [
  { id: '1', name: 'Facultad de Medicina', studentsWaiting: 8, estimatedArrival: '2 min' },
  { id: '2', name: 'Biblioteca Central', studentsWaiting: 5, estimatedArrival: '7 min' },
];

export const getRouteStops = async (routeId: string): Promise<BusStop[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockStops), 300));
};

export const getRouteBuses = async (routeId: string): Promise<Bus[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([]), 300));
};

export const getNearbyStops = async (latitude: number, longitude: number): Promise<BusStop[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockStops), 500));
};

export const getBusLocation = async (busId: string): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => setTimeout(() => resolve({ lat: -0.2105, lng: -78.4917 }), 300));
};