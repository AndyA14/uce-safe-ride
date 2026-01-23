// src/services/routeService.ts

import axios from 'axios';
import api from '@/services/api';
// ✅ Importamos todo lo necesario desde el archivo de tipos
import { Route, BusStop, Bus, ActiveRouteResponse, RouteDetails } from '@/types/route';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003/api/v1/routes';
const UI_COLORS = ['#0033A0', '#22C55E', '#FFC400', '#EF4444', '#8B5CF6'];

/* ======================================================
   SERVICIO DE RUTAS
====================================================== */
export const routeService = {

  /**
   * Obtiene todas las rutas disponibles (adaptadas para UI)
   */
  getAllRoutes: async (token?: string): Promise<Route[]> => {
    token ||= localStorage.getItem('token') || '';

    try {
      const response = await axios.get<any[]>(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.map((route, index) => ({
        id: route.id,
        name: route.name,
        direction: route.direction || 'Circular',
        active: route.active ?? true,
        polyline: route.polyline || '', // ✅ Agregamos la propiedad polyline
        color: UI_COLORS[index % UI_COLORS.length],
        activeBuses: Math.floor(Math.random() * 5) + 1,
        totalStops: 8,
      }));
    } catch (error) {
      console.error('❌ Error cargando rutas:', error);
      return [];
    }
  },

  /**
   * Obtiene una ruta por ID (adaptada para UI)
   */
  getRouteById: async (id: string, token?: string): Promise<Route | null> => {
    token ||= localStorage.getItem('token') || '';

    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        id: response.data.id,
        name: response.data.name,
        direction: response.data.direction || 'Circular',
        active: response.data.active,
        polyline: response.data.polyline || '', // ✅ Agregamos la propiedad polyline
        color: '#0033A0',
        activeBuses: 3,
        totalStops: 8,
      };
    } catch (error) {
      console.error(`❌ Error obteniendo ruta ${id}:`, error);
      return null;
    }
  },

  /**
   * Obtiene la ruta activa del usuario logueado
   */
  getActiveRoute: async (token: string): Promise<ActiveRouteResponse | null> => {
    try {
      const response = await axios.get<ActiveRouteResponse>(`${API_URL}/active/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('❌ Error verificando ruta activa:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles completos de una ruta (INCLUYE polyline)
   */
  getRouteDetails: async (routeId: string): Promise<RouteDetails> => {
    try {
      const response = await api.get<RouteDetails>(`/routes/${routeId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error obteniendo detalles de la ruta ${routeId}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene las paradas de una ruta
   */
  getRouteStops: async (routeId: string): Promise<BusStop[]> => {
    const mockStops: BusStop[] = [
      { id: '1', name: 'Facultad de Medicina', studentsWaiting: 8, estimatedArrival: '2 min' },
      { id: '2', name: 'Biblioteca Central', studentsWaiting: 5, estimatedArrival: '7 min' },
    ];

    return new Promise((resolve) => setTimeout(() => resolve(mockStops), 300));
  },

  /**
   * Obtiene los buses activos de una ruta
   */
  getRouteBuses: async (routeId: string): Promise<Bus[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([]), 300));
  },

  /**
   * Obtiene paradas cercanas a una ubicación GPS
   */
  getNearbyStops: async (latitude: number, longitude: number): Promise<BusStop[]> => {
    const mockStops: BusStop[] = [
      { id: '1', name: 'Facultad de Medicina', studentsWaiting: 8, estimatedArrival: '2 min' },
      { id: '2', name: 'Biblioteca Central', studentsWaiting: 5, estimatedArrival: '7 min' },
    ];

    return new Promise((resolve) => setTimeout(() => resolve(mockStops), 500));
  },

  /**
   * Obtiene la ubicación de un bus
   */
  getBusLocation: async (busId: string): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ lat: -0.2105, lng: -78.4917 }), 300)
    );
  },
};
