import React, { useState, useEffect } from 'react';
import { Bus, Navigation, Clock, Gauge } from 'lucide-react';

const TrackingPage: React.FC = () => {
  const [busPosition, setBusPosition] = useState({ x: 20, y: 30 });
  const [speed, setSpeed] = useState(35);
  const [eta, setEta] = useState(5);

  // Tu lógica de simulación original
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPosition(prev => ({
        x: (prev.x + 0.5) % 90, 
        y: 30 + Math.sin(prev.x / 10) * 10
      }));
      setSpeed(Math.floor(Math.random() * 15) + 25);
      setEta(prev => (prev > 0 ? prev - 0.05 : 5));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 p-4 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rastreo en Tiempo Real</h1>
          <p className="text-gray-500">Unidad #45 • Ruta Norte</p>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"/>
          En vivo
        </div>
      </div>

      {/* Contenedor del Mapa */}
      <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-3xl shadow-inner border border-gray-200 dark:border-slate-700 overflow-hidden">
        
        {/* Grilla de fondo para simular mapa */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {/* Ruta Dibujada (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M0,150 Q400,250 800,150 T1600,150" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="10,5" className="opacity-40" />
        </svg>

        {/* Icono del Bus Animado */}
        <div className="absolute transition-all duration-500 ease-linear z-20"
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
              <span className="font-bold text-[#003da5] text-lg">{Math.ceil(eta)} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-2 text-sm"><Gauge size={16}/> Velocidad</span>
              <span className="font-bold text-gray-900 dark:text-white">{speed} km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;