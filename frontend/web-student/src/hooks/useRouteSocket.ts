import { useEffect, useRef, useState, useCallback } from 'react';

// Apuntamos al endpoint real
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8010/api/v1/ws/trips';

export const useRouteSocket = (token: string | null, tripId: string | number | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    // 🛑 AHORA VALIDAMOS QUE EXISTA TRIP_ID
    if (!token || !tripId) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    // Enviamos el trip_id en la URL
    const url = `${WS_URL}?token=${token}&trip_id=${tripId}`;
    console.log('🔌 Conectando Real:', url);
    
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('🟢 Conectado al viaje real:', tripId);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📍 GPS REAL RECIBIDO:", data); 
        setLastMessage(data);
      } catch (e) {
        console.warn('⚠️ Error parsing:', event.data);
      }
    };

    ws.onclose = () => setIsConnected(false);

  }, [token, tripId]); // Dependencia agregada: tripId

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  return { isConnected, lastMessage };
};