/**
 * Trip Service
 * Handles trip history, active trips, and trip requests
 * 
 * TODO: Connect to Python Backend API
 * Replace mock implementations with actual API calls to:
 * - GET /api/trips/history
 * - GET /api/trips/active
 * - POST /api/trips/request
 * - PUT /api/trips/:id/complete
 */

import { Trip } from '@/types/user';

// Mock trip data - TODO: Remove when backend is connected
const mockStudentTrips: Trip[] = [
  {
    id: '1',
    date: '2024-01-15',
    route: 'Ruta Norte',
    pickup: 'Facultad de Ingeniería',
    dropoff: 'Entrada Principal',
    duration: '15 min',
  },
  {
    id: '2',
    date: '2024-01-14',
    route: 'Ruta Sur',
    pickup: 'Biblioteca Central',
    dropoff: 'Coliseo UCE',
    duration: '12 min',
  },
  {
    id: '3',
    date: '2024-01-13',
    route: 'Ruta Centro',
    pickup: 'Entrada Principal',
    dropoff: 'Facultad de Medicina',
    duration: '20 min',
  },
  {
    id: '4',
    date: '2024-01-12',
    route: 'Ruta Norte',
    pickup: 'Coliseo UCE',
    dropoff: 'Facultad de Ingeniería',
    duration: '18 min',
  },
  {
    id: '5',
    date: '2024-01-11',
    route: 'Ruta Sur',
    pickup: 'Facultad de Medicina',
    dropoff: 'Biblioteca Central',
    duration: '10 min',
  },
];

const mockDriverTrips: Trip[] = [
  {
    id: '1',
    date: '2024-01-15',
    route: 'Ruta Norte',
    pickup: 'Terminal Norte',
    dropoff: 'Terminal Sur',
    duration: '45 min',
  },
  {
    id: '2',
    date: '2024-01-14',
    route: 'Ruta Norte',
    pickup: 'Terminal Norte',
    dropoff: 'Terminal Sur',
    duration: '42 min',
  },
  {
    id: '3',
    date: '2024-01-13',
    route: 'Ruta Centro',
    pickup: 'Terminal Central',
    dropoff: 'Terminal Este',
    duration: '38 min',
  },
];

/**
 * Gets trip history for a user
 * TODO: Connect to Python Backend API - GET /api/trips/history
 */
export const getTripHistory = async (userId: string, role: 'student' | 'driver'): Promise<Trip[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/trips/history?userId=${userId}&role=${role}`);
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(role === 'student' ? mockStudentTrips : mockDriverTrips);
    }, 500);
  });
};

/**
 * Gets the current active trip
 * TODO: Connect to Python Backend API - GET /api/trips/active
 */
export const getActiveTrip = async (userId: string): Promise<Trip | null> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/trips/active?userId=${userId}`);
  // if (response.ok) return response.json();
  // return null;
  
  return null;
};

/**
 * Requests a new trip (for students)
 * TODO: Connect to Python Backend API - POST /api/trips/request
 */
export const requestTrip = async (
  userId: string,
  pickupStop: string,
  route: string
): Promise<Trip> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/trips/request', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userId, pickupStop, route }),
  // });
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        route,
        pickup: pickupStop,
        dropoff: 'Pendiente',
        duration: 'En curso',
      });
    }, 500);
  });
};

/**
 * Completes a trip
 * TODO: Connect to Python Backend API - PUT /api/trips/:id/complete
 */
export const completeTrip = async (tripId: string): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch(`/api/trips/${tripId}/complete`, { method: 'PUT' });
  
  return new Promise((resolve) => {
    setTimeout(resolve, 300);
  });
};
