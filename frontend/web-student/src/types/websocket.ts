// src/types/websocket.ts

export type WebSocketAction = 'subscribe' | 'publish';

export interface SubscribePayload {
  action: 'subscribe';
  route_id: string;
}

export interface PublishPayload {
  action: 'publish';
  routing_key: string;
  payload: Record<string, any>; // Define aquí la estructura de tus coordenadas si la tienes fija
}

// Lo que recibimos del REST API
export interface ActiveRouteResponse {
  route_id: string;
  status: 'active' | 'pending' | 'finished';
  // otros campos que devuelva tu endpoint
}

// Lo que recibimos por el Socket
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}