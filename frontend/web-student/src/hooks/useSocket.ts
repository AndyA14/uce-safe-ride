import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:8009/ws';

type SocketMessage = {
  type?: string;
  event_type?: string;
  topic?: string;
  message?: string;
  [key: string]: any;
};

export const useSocket = (token: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // 1. Conectar al montar
  useEffect(() => {
    if (!token) return;  // Si no hay token, no intentamos conectar

    // Evitar dobles conexiones en React StrictMode
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    console.log("🔌 Iniciando conexión WS...");
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 WS Conectado");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WS Recibido:", data);
        setLastMessage(data);  // Guardamos el último mensaje para que la UI reaccione
      } catch (e) {
        console.error("Error parseando WS:", e);
      }
    };

    ws.onclose = () => {
      console.log("🔴 WS Desconectado");
      setIsConnected(false);
    };

    return () => {
      ws.close();  // Limpieza al desmontar el componente
    };
  }, [token]);

  // 2. Función para Suscribirse a un Tópico (Ruta/Bus)
  const subscribe = useCallback((topic: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log(`📡 Suscribiendo a: ${topic}`);
      socketRef.current.send(JSON.stringify({ action: "subscribe", topic }));
    } else {
      console.warn("⚠️ No se pudo suscribir: WS no conectado");
    }
  }, []);

  // 3. Función para Desuscribirse
  const unsubscribe = useCallback((topic: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log(`🔕 Desuscribiendo de: ${topic}`);
      socketRef.current.send(JSON.stringify({ action: "unsubscribe", topic }));
    } else {
      console.warn("⚠️ No se pudo desuscribir: WS no conectado");
    }
  }, []);

  // 4. Función para Publicar Eventos (Solo Conductores)
  const publish = useCallback((routingKey: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        action: "publish",
        routing_key: routingKey,
        payload: payload
      };
      socketRef.current.send(JSON.stringify(message));
      console.log("📤 Enviando evento:", message);
    } else {
      console.warn("⚠️ No se puede publicar: WS desconectado");
    }
  }, []);

  return { isConnected, lastMessage, subscribe, unsubscribe, publish };
};
