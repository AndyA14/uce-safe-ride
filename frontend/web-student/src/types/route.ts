export interface Route {
    id: string;
    name: string;
    direction: string; 
    active: boolean; 
 
    color: string;
    activeBuses: number;
    totalStops: number;
  }
  export interface RouteCoordinates {
    lat: number;
    lng: number;
  }
  
  export interface CustomRoute {
    id: string;
    name: string;
    origin: RouteCoordinates;
    destination: RouteCoordinates;
    active: boolean;
    polyline?: string; 
  }
  
  export interface CreateCustomRoutePayload {
    name: string;
    origin: RouteCoordinates;
    destination: RouteCoordinates;
  }