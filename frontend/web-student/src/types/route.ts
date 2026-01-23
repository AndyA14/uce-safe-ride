// src/types/route.ts

// =========================
// COORDENADAS DE RUTA
// =========================
export interface RouteCoordinates {
  lat: number;
  lng: number;
}

// =========================
// RUTAS GENERALES
// =========================
export interface Route {
  id: string;
  name: string;
  direction?: string;
  active: boolean;
  description?: string;
  polyline?: string;  // Opcional para evitar bloqueos si no viene del API
  stops?: any[];    
  created_at?: string;
  // Campos para UI
  color?: string;
  activeBuses?: number;
  totalStops?: number;
}

// =========================
// RUTAS PERSONALIZADAS (ESTUDIANTES)
// =========================
export interface CustomRoute {
  id: string;
  name: string;
  origin: RouteCoordinates;
  destination: RouteCoordinates;
  active: boolean;
  polyline?: string;  // Opcional, ya que las rutas personalizadas pueden no tenerla
}

export interface CreateCustomRoutePayload {
  name: string;
  origin: RouteCoordinates;
  destination: RouteCoordinates;
}

// =========================
// PARADAS DE BUS
// =========================
export interface BusStop {
  id: string;
  name: string;
  studentsWaiting: number;
  estimatedArrival: string;
}

// =========================
// BUSES / VEHÍCULOS
// =========================
export interface Bus {
  id: string;
  plate: string;
  driverName?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// =========================
// RUTAS ACTIVAS PARA EL USUARIO
// =========================
export interface ActiveRouteResponse {
  route_id: string;
  status: string;
}

// =========================
// DETALLES DE UNA RUTA (INCLUYE polyline)
// =========================
export interface RouteDetails {
  id: string;
  name: string;
  origin: string;
  destination: string;
  polyline: string;
  active: boolean;
}
