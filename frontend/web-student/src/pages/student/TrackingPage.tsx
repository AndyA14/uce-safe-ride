import React, { useState, useEffect } from 'react';
import { Bus, Wifi, WifiOff, Navigation, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouteSocket } from '@/hooks/useRouteSocket'; // Usamos el NUEVO hook

const TrackingPage: React.FC = () => {
  const { token } = useAuth();
  
  // Usamos el hook inteligente. Él se encarga de llamar al REST y suscribirse.
  const { isConnected, lastMessage, activeRouteId } = useRouteSocket(token);

  // Estados de UI
  const [busLocation, setBusLocation] = useState<{lat: number, lng: number} | null>(null);
  const [eta, setEta] = useState<string>('--');
  const [lastAlert, setLastAlert] = useState<string | null>(null);

  // Reacción a mensajes reales
  useEffect(() => {
    if (!lastMessage) return;

    // Ajusta estos 'cases' según la estructura exacta de tu evento RabbitMQ->WS
    switch (lastMessage.type || lastMessage.event_type) { 
      case 'bus.location_update':
        // Suponiendo payload: { lat: -0.123, lng: -78.123, ... }
        if (lastMessage.payload) {
            setBusLocation({ 
                lat: lastMessage.payload.lat, 
                lng: lastMessage.payload.lng 
            });
        }
        break;
        
      case 'route.eta_update':
        setEta(`${lastMessage.payload.minutes} min`);
        break;

      case 'traffic.alert':
         setLastAlert(lastMessage.payload.message);
         setTimeout(() => setLastAlert(null), 5000);
         break;
    }
  }, [lastMessage]);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Rastreo en Tiempo Real</h1>
          <p className="text-gray-500">
             {activeRouteId ? `Ruta Activa: ${activeRouteId}` : 'Buscando ruta asignada...'}
          </p>
        </div>
        
        {/* Indicador de Estado */}
        <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${
          isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isConnected ? 'En vivo' : 'Desconectado'}
        </div>
      </div>

      {/* Alerta */}
      {lastAlert && (
        <div className="absolute z-50 top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <AlertTriangle size={18} /> {lastAlert}
        </div>
      )}

      {/* Mapa */}
      <div className="flex-1 relative bg-slate-100 rounded-2xl overflow-hidden border border-gray-300">
        
        {/* Lógica de Renderizado del Mapa */}
        {busLocation ? (
            <div className="absolute inset-0 flex items-center justify-center">
                {/* AQUI DEBES INTEGRAR TU MAPA (Leaflet/Google Maps).
                   Usa 'busLocation.lat' y 'busLocation.lng' para poner el Marker.
                   Por ahora, mostramos coordenadas crudas para debug.
                */}
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                    <Bus className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="font-mono text-sm">Lat: {busLocation.lat}</p>
                    <p className="font-mono text-sm">Lng: {busLocation.lng}</p>
                    <p className="text-xs text-gray-500 mt-2">Datos en tiempo real</p>
                </div>
            </div>
        ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                {activeRouteId 
                    ? "Esperando ubicación del conductor..." 
                    : "No tienes una ruta activa asignada."}
            </div>
        )}

      </div>
    </div>
  );
};

export default TrackingPage;