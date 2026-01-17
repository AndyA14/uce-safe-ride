import React, { useState, useEffect } from 'react';
import { Bus, Navigation, Clock, Gauge, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';  // Importamos el Contexto de Autenticación
import { useSocket } from '@/hooks/useSocket';  // Hook para WebSockets

const TrackingPage: React.FC = () => {
  // 1. Obtenemos el token REAL del usuario logueado desde el contexto
  const { token } = useAuth();  // Esto proporciona el token autenticado
  
  // 2. Se lo pasamos al hook de WebSockets
  const { isConnected, lastMessage, subscribe, unsubscribe } = useSocket(token);

  // 3. Estados de la UI
  const [busPosition, setBusPosition] = useState({ x: 10, y: 30 }); // Empieza al inicio
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(15);
  const [lastAlert, setLastAlert] = useState<string | null>(null);

  // 4. Suscripción al entrar a la pantalla
  useEffect(() => {
    if (isConnected && token) {
      // Nos suscribimos a la ruta específica (ej: Ruta Norte ID: 100)
      subscribe("route-100");
    }
    // Cleanup: Al salir de la pantalla, nos desuscribimos
    return () => {
      if (isConnected) unsubscribe("route-100");
    };
  }, [isConnected, token, subscribe, unsubscribe]);

  // 5. 🧠 CEREBRO REACTIVO: Reaccionamos a los mensajes de WebSocket
  useEffect(() => {
    if (!lastMessage) return;

    console.log("⚡ Evento procesado en UI:", lastMessage);

    switch (lastMessage.event_type) {
      case 'bus.location_update':
        // El backend nos dice la velocidad y avance real
        if (lastMessage.speed) setSpeed(lastMessage.speed);
        
        // Simulación visual: Avanzamos un poco en el mapa por cada ping recibido
        // (En un mapa real usarías lat/lng del mensaje)
        setBusPosition(prev => ({
          x: (prev.x + 2) % 95, 
          y: 30 + Math.sin((prev.x + 2) / 10) * 10
        }));
        break;

      case 'route.eta_update':
        if (lastMessage.minutes) setEta(lastMessage.minutes);
        break;

      case 'traffic.alert':
      case 'route.traffic_detected':
        // Mostramos alerta visual si hay tráfico
        setLastAlert(lastMessage.message);
        // Borramos la alerta después de 5 segundos
        setTimeout(() => setLastAlert(null), 5000);
        break;
        
      default:
        break;
    }
  }, [lastMessage]);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 p-4 animate-fade-in relative">
      
      {/* --- Header con Estado de Conexión --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rastreo en Tiempo Real</h1>
          <p className="text-gray-500">Unidad #45 • Ruta Norte</p>
        </div>
        
        {/* Badge de Estado Conectado/Desconectado */}
        <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${
          isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isConnected ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"/>
              En vivo
            </>
          ) : 'Reconectando...'}
        </div>
      </div>

      {/* --- Alerta Flotante (Toaster) --- */}
      {lastAlert && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertTriangle size={20} className="text-white" />
          <span className="font-bold">{lastAlert}</span>
        </div>
      )}

      {/* --- Contenedor del Mapa --- */}
      <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-3xl shadow-inner border border-gray-200 dark:border-slate-700 overflow-hidden">
        
        {/* Grilla de fondo */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {/* Ruta Dibujada (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M0,150 Q400,250 800,150 T1600,150" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="10,5" className="opacity-40" />
        </svg>

        {/* Icono del Bus Animado */}
        <div className="absolute transition-all duration-700 ease-out z-20"
             style={{ left: `${busPosition.x}%`, top: `${busPosition.y + 10}%` }}>
          <div className="relative -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
            <div className="w-14 h-14 bg-[#003da5] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 transform group-hover:scale-110 transition-transform">
              <Bus className="w-7 h-7 text-white" />
            </div>
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-3 py-1 rounded-lg shadow-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Bus Escolar #45
            </div>
          </div>
        </div>

        {/* Panel Flotante de Información */}
        <div className="absolute top-4 right-4 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-2 text-sm"><Navigation size={16}/> Próxima Parada</span>
              <span className="font-bold text-gray-900 dark:text-white">Fac. Ingeniería</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-2 text-sm"><Clock size={16}/> Llegada Estimada</span>
              <span className="font-bold text-[#003da5] text-lg">{eta} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-2 text-sm"><Gauge size={16}/> Velocidad Real</span>
              {/* Aquí mostramos la velocidad que viene del backend */}
              <span className="font-bold text-gray-900 dark:text-white transition-all duration-300">{speed} km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
