import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouteSocket } from '@/hooks/useRouteSocket'; 
import { Navigation, Wifi, WifiOff, MapPin } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const { isConnected, activeRouteId, publish } = useRouteSocket(token);

  const [isTransmitting, setIsTransmitting] = useState(false);
  const [location, setLocation] = useState({ lat: -0.1915, lng: -78.4890 }); 

  // Simulación de GPS: Cuando se activa "Transmitir", enviamos datos cada 3 segundos
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTransmitting && isConnected && activeRouteId) {
      console.log("🚀 Iniciando transmisión de GPS...");
      
      interval = setInterval(() => {
        // 1. Simular movimiento (en producción esto vendría de navigator.geolocation)
        const newLat = location.lat + (Math.random() - 0.5) * 0.001;
        const newLng = location.lng + (Math.random() - 0.5) * 0.001;

        setLocation({ lat: newLat, lng: newLng });

        const payload = {
            lat: newLat,
            lng: newLng,
            speed: Math.floor(Math.random() * 60), // Velocidad simulada
            driver_id: user?.id
        };

        // Usamos la función publish del hook
        publish('route.event', payload);
        
        console.log("📤 Coordenada enviada:", payload);

      }, 3000); // Enviar cada 3 segundos
    }

    return () => clearInterval(interval);
  }, [isTransmitting, isConnected, activeRouteId, location, publish, user]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Conductor</h1>
          <p className="text-gray-500">
            {activeRouteId 
              ? `Ruta Asignada: ${activeRouteId}` 
              : '🔴 No tienes ruta activa asignada'}
          </p>
        </div>
        
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-bold ${
          isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
          {isConnected ? 'Sistema Online' : 'Desconectado'}
        </div>
      </header>

      {/* Panel de Control Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tarjeta de Estado de Transmisión */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Navigation className="text-blue-600" />
            Estado de Viaje
          </h2>
          
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl font-mono text-gray-700">
              {isTransmitting ? 'EN RUTA' : 'DETENIDO'}
            </div>
            
            <button
              onClick={() => setIsTransmitting(!isTransmitting)}
              disabled={!isConnected || !activeRouteId}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition-all ${
                !isConnected || !activeRouteId 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isTransmitting 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isTransmitting ? 'DETENER TRANSMISIÓN' : 'INICIAR RUTA'}
            </button>
            
            {!activeRouteId && (
              <p className="text-sm text-red-500 text-center">
                ⚠️ Debes tener una ruta activa (creada en backend) para iniciar.
              </p>
            )}
          </div>
        </div>

        {/* Tarjeta de Datos Técnicos */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="text-purple-600" />
            Telemetría
          </h2>
          <div className="space-y-2 font-mono text-sm text-gray-600">
            <div className="flex justify-between border-b pb-2">
              <span>Latitud:</span>
              <span>{location.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Longitud:</span>
              <span>{location.lng.toFixed(6)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Paquetes Enviados:</span>
              <span className={isTransmitting ? "text-green-600 animate-pulse" : ""}>
                {isTransmitting ? "Enviando..." : "Pausa"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;