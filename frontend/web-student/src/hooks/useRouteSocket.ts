import { useEffect, useRef, useState, useCallback } from 'react';

/* ======================================================
   CONFIGURACIÓN - WS Gateway (Puerto 8009)
====================================================== */
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8009/ws';

/* ======================================================
   TYPES
====================================================== */
export interface SocketLocation {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
}

/* ======================================================
   HOOK: useRouteSocket
====================================================== */
export const useRouteSocket = (
  token: string | null,
  tripId: string | number | null
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [socketLocation, setSocketLocation] = useState<SocketLocation | null>(null);
  const [lastNotification, setLastNotification] = useState<any>(null); // Nuevo estado para alertas

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  /**
   * 🧠 PARSER UNIVERSAL - Lee CUALQUIER formato de mensaje
   */
  const parseLocationFromMessage = useCallback((rawData: any): SocketLocation | null => {
    try {
      console.log('📦 [Parser] Raw data:', rawData);

      let lat: any = null;
      let lng: any = null;
      let heading: any = 0;
      let speed: any = 0;

      // Buscar coordenadas en diferentes niveles
      lat = rawData.latitude || rawData.lat || lat;
      lng = rawData.longitude || rawData.lng || lng;
      heading = rawData.heading || rawData.course || rawData.bearing || heading;
      speed = rawData.speed || rawData.velocity || speed;

      if (!lat && rawData.data) {
        lat = rawData.data.latitude || rawData.data.lat || lat;
        lng = rawData.data.longitude || rawData.data.lng || lng;
        heading = rawData.data.heading || rawData.data.course || heading;
        speed = rawData.data.speed || speed;
      }

      if (!lat && rawData.payload) {
        lat = rawData.payload.latitude || rawData.payload.lat || lat;
        lng = rawData.payload.longitude || rawData.payload.lng || lng;
        heading = rawData.payload.heading || heading;
        speed = rawData.payload.speed || speed;
      }

      if (!lat && rawData.location) {
        lat = rawData.location.latitude || rawData.location.lat || lat;
        lng = rawData.location.longitude || rawData.location.lng || lng;
        heading = rawData.location.heading || heading;
        speed = rawData.location.speed || speed;
      }

      const numLat = Number(lat);
      const numLng = Number(lng);
      const numHeading = Number(heading);
      const numSpeed = Number(speed);

      if (!isNaN(numLat) && !isNaN(numLng) && numLat !== 0 && numLng !== 0) {
        const location: SocketLocation = {
          lat: numLat,
          lng: numLng,
          heading: !isNaN(numHeading) ? numHeading : 0,
          speed: !isNaN(numSpeed) ? numSpeed : 0,
        };
        console.log('✅ [Parser] Ubicación extraída:', location);
        return location;
      }

      console.warn('⚠️ [Parser] No se encontraron coordenadas válidas en:', rawData);
      return null;

    } catch (error) {
      console.error('❌ [Parser] Error parseando ubicación:', error);
      return null;
    }
  }, []);

  /**
   * Función para conectar al WebSocket
   */
  const connect = useCallback(() => {
    if (!token || !tripId) {
      if (!token) console.log('⚠️ [WebSocket] Sin token');
      if (!tripId) console.log('⚠️ [WebSocket] Sin tripId');
      return;
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ [WebSocket] Ya conectado');
      return;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    const url = `${WS_URL}?token=${token}&trip_id=${tripId}`;
    console.log('='.repeat(60));
    console.log('🔌 CONECTANDO WEBSOCKET');
    console.log('='.repeat(60));
    console.log('URL:', url);
    console.log('Trip ID:', tripId);

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('='.repeat(60));
        console.log('🟢 WEBSOCKET CONECTADO');
        console.log('='.repeat(60));
        setIsConnected(true);
        reconnectAttempts.current = 0;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);

          console.log('='.repeat(60));
          console.log('📨 MENSAJE WEBSOCKET RECIBIDO');
          console.log('='.repeat(60));
          console.log('Raw:', rawData);

          setLastMessage(rawData);

          // Parsear ubicación
          const location = parseLocationFromMessage(rawData);
          if (location) {
            console.log('🚌 ACTUALIZANDO POSICIÓN DEL BUS:', location);
            setSocketLocation(location);
          } else {
            console.log('ℹ️ Mensaje sin coordenadas de ubicación');
          }

          // Detectar alertas
          if (rawData.event_type && rawData.event_type !== 'trip.location.updated') {
            console.log("🔔 Alerta recibida:", rawData);
            setLastNotification(rawData); // Guardar la alerta
          }

        } catch (e) {
          console.warn('⚠️ Error parseando mensaje:', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('='.repeat(60));
        console.log('🔴 WEBSOCKET DESCONECTADO');
        console.log('='.repeat(60));
        console.log('Code:', event.code);
        console.log('Reason:', event.reason || 'Sin razón');

        setIsConnected(false);

        if (
          !event.wasClean &&
          tripId &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          console.log(`🔄 Reintento ${reconnectAttempts.current}/${maxReconnectAttempts} en ${delay}ms`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('='.repeat(60));
        console.error('❌ WEBSOCKET ERROR');
        console.error('='.repeat(60));
        console.error('Error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Error creando WebSocket:', error);
      setIsConnected(false);
    }
  }, [token, tripId, parseLocationFromMessage]);

  const publish = useCallback((topic: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        topic,
        ...payload,
        timestamp: new Date().toISOString(),
      });
      socketRef.current.send(message);
      console.log('📤 Mensaje enviado:', { topic, payload });
    } else {
      console.warn('⚠️ No se puede enviar: Socket desconectado');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Cerrando WebSocket');
      socketRef.current.close(1000, 'Desconexión manual');
      socketRef.current = null;
    }
    setIsConnected(false);
    setSocketLocation(null);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000, 'Componente desmontado');
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastMessage,
    socketLocation,
    lastNotification,  // Retornar las alertas
    publish,
    disconnect,
  };
};
