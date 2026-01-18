import { useEffect, useRef, useState, useCallback } from 'react';
import { getActiveRoute } from '@/services/routeService';

// Ajusta esto a tu URL real de producción
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8009/ws';

export const useRouteSocket = (token: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Función interna para manejar la lógica de negocio post-conexión
  const handleAuthAndSubscription = useCallback(async (socket: WebSocket, currentToken: string) => {
    try {
      console.log("🔍 Verificando ruta activa vía REST...");
      // 1. Consultamos al endpoint REST
      const routeData = await getActiveRoute(currentToken);

      if (routeData && routeData.route_id) {
        setActiveRouteId(routeData.route_id);
        console.log(`✅ Ruta detectada: ${routeData.route_id}`);

        // 2. Si el socket sigue abierto, enviamos la suscripción
        if (socket.readyState === WebSocket.OPEN) {
          const payload = {
            action: "subscribe",
            route_id: routeData.route_id
          };
          socket.send(JSON.stringify(payload));
          console.log("📡 Suscripción enviada automáticamente al WebSocket");
        }
      } else {
        console.log("ℹ️ Usuario sin ruta activa. Socket conectado en espera.");
      }
    } catch (err) {
      console.error("❌ Error en flujo de suscripción:", err);
    }
  }, []);

  const connect = useCallback(() => {
    if (!token) return;

    // Evitar reconexiones si ya está abierto
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    // URL limpia con token en Query Param
    const url = `${WS_URL}?token=${token}`;
    console.log("🔌 Conectando WebSocket...");
    
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 WebSocket Conectado (Open)");
      setIsConnected(true);
      // Iniciar el flujo de negocio
      handleAuthAndSubscription(ws, token);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (e) {
        console.error("⚠️ Error parseando mensaje WS:", e);
      }
    };

    ws.onclose = (event) => {
      console.log("🔴 WebSocket Desconectado");
      setIsConnected(false);
      
      // Reconexión automática si no fue cierre limpio
      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Intentando reconectar...");
          connect();
        }, 3000);
      }
    };

    ws.onerror = (err) => {
      console.error("⚠️ Error WebSocket:", err);
      ws.close();
    };

  }, [token, handleAuthAndSubscription]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  // Exponemos publish por si es un conductor
  const publish = useCallback((routingKey: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action: "publish",
        routing_key: routingKey,
        payload
      }));
    }
  }, []);

  return { isConnected, lastMessage, activeRouteId, publish };
};