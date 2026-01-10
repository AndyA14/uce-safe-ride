/**
 * Route Service
 * Handles bus routes, stops, and real-time bus locations
 * 
 * TODO: Connect to Python Backend API
 * Replace mock implementations with actual API calls to:
 * - GET /api/routes
 * - GET /api/routes/:id/stops
 * - GET /api/routes/:id/buses
 * - GET /api/buses/:id/location
 */

import { BusStop, Bus } from '@/types/user';

// Types for routes
export interface Route {
  id: string;
  name: string;
  color: string;
  activeBuses: number;
  totalStops: number;
}

// Mock route data - TODO: Remove when backend is connected
const mockRoutes: Route[] = [
  { id: '1', name: 'Ruta Norte', color: '#0033A0', activeBuses: 3, totalStops: 8 },
  { id: '2', name: 'Ruta Sur', color: '#22C55E', activeBuses: 2, totalStops: 6 },
  { id: '3', name: 'Ruta Centro', color: '#FFC400', activeBuses: 4, totalStops: 10 },
];

const mockStops: BusStop[] = [
  { id: '1', name: 'Facultad de Medicina', studentsWaiting: 8, estimatedArrival: '2 min' },
  { id: '2', name: 'Biblioteca Central', studentsWaiting: 5, estimatedArrival: '7 min' },
  { id: '3', name: 'Facultad de Ingeniería', studentsWaiting: 12, estimatedArrival: '12 min' },
  { id: '4', name: 'Entrada Principal', studentsWaiting: 3, estimatedArrival: '18 min' },
  { id: '5', name: 'Coliseo UCE', studentsWaiting: 6, estimatedArrival: '22 min' },
];

const mockBuses: Bus[] = [
  {
    id: '1',
    name: 'Bus 12',
    driver: 'Carlos Mendoza',
    status: 'active',
    currentRoute: 'Ruta Norte',
    passengers: 28,
    capacity: 40,
  },
  {
    id: '2',
    name: 'Bus 15',
    driver: 'Juan Pérez',
    status: 'active',
    currentRoute: 'Ruta Sur',
    passengers: 15,
    capacity: 40,
  },
];

/**
 * Gets all available routes
 * TODO: Connect to Python Backend API - GET /api/routes
 */
export const getRoutes = async (): Promise<Route[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/routes');
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRoutes);
    }, 500);
  });
};

/**
 * Gets stops for a specific route
 * TODO: Connect to Python Backend API - GET /api/routes/:id/stops
 */
export const getRouteStops = async (routeId: string): Promise<BusStop[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/routes/${routeId}/stops`);
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStops);
    }, 500);
  });
};

/**
 * Gets active buses on a route
 * TODO: Connect to Python Backend API - GET /api/routes/:id/buses
 */
export const getRouteBuses = async (routeId: string): Promise<Bus[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/routes/${routeId}/buses`);
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBuses);
    }, 500);
  });
};

/**
 * Gets nearby stops based on user location
 * TODO: Connect to Python Backend API - GET /api/stops/nearby
 */
export const getNearbyStops = async (latitude: number, longitude: number): Promise<BusStop[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/stops/nearby?lat=${latitude}&lng=${longitude}`);
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStops.slice(0, 4));
    }, 500);
  });
};

/**
 * Gets real-time bus location
 * TODO: Connect to Python Backend API - GET /api/buses/:id/location
 */
export const getBusLocation = async (busId: string): Promise<{ lat: number; lng: number } | null> => {
  // TODO: Replace with actual API call using WebSocket for real-time updates
  // const response = await fetch(`/api/buses/${busId}/location`);
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ lat: -0.2105, lng: -78.4917 }); // UCE coordinates
    }, 300);
  });
};
