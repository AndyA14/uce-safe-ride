import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, AlertTriangle, Power, Mic, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { isConnected, publish } = useSocket(token);

  const [isDriving, setIsDriving] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDriving && isConnected) {
      interval = setInterval(() => {
        const newSpeed = Math.floor(Math.random() * (60 - 20 + 1) + 20);
        setCurrentSpeed(newSpeed);
        
        publish("route.update", {
          event_type: "bus.location_update",
          route_id: "100",
          speed: newSpeed,
          coordinates: { lat: -0.198, lng: -78.50 }
        });
        
      }, 2000);
    } else {
      setCurrentSpeed(0);
    }
    return () => clearInterval(interval);
  }, [isDriving, isConnected, publish]);

  const sendAlert = (message: string) => {
    publish("route.update", {
      event_type: "traffic.alert",
      route_id: "100",
      message: message
    });
    alert(`Enviado: ${message}`);
  };

  return (
    // 🎨 1. FONDO MÁS OSCURO (slate-100) para mejor contraste
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-8 md:p-12 pb-24 animate-fade-in transition-colors duration-300">
      
      {/* 📏 2. CONTENEDOR CENTRADO (Evita pegarse al sidebar) */}
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              Unidad #45 <span className="text-[#FFC107] animate-pulse text-xl">● Online</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">Hola, {user?.name || "Conductor"}</p>
          </div>
          <div className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-3 shadow-sm ${isConnected ? "bg-white text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" : "bg-red-50 text-red-700 border border-red-200"}`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {isConnected ? "Sistema Conectado" : "Desconectado"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🛠️ 3. TARJETA PRINCIPAL ARREGLADA (Ahora cambia de color) */}
          <div className="lg:col-span-2 space-y-8">
            <div 
              className={`relative rounded-[2rem] p-10 shadow-xl transition-all duration-500 border
                ${isDriving 
                  ? "bg-gradient-to-br from-green-600 to-emerald-800 text-white border-transparent" // Modo Conduciendo (Siempre Verde)
                  : "bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800" // Modo Espera (Blanco en día / Oscuro en noche)
                }`}
            >
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="opacity-70 font-medium mb-2 text-lg uppercase tracking-wider">Estado del Servicio</p>
                  <h2 className="text-5xl font-bold mb-6 tracking-tight">{isDriving ? "EN RUTA" : "EN ESPERA"}</h2>
                  <div className="flex items-center gap-3 text-2xl">
                    <MapPin className="text-[#FFC107] w-8 h-8" /> 
                    <span className="font-semibold">Ruta Norte - Carcelén</span>
                  </div>
                </div>
                
                {/* Velocímetro: Fondo gris en día, oscuro en noche */}
                <div className={`text-center p-6 rounded-3xl backdrop-blur-md border shadow-inner w-32
                  ${isDriving 
                    ? "bg-black/20 border-white/10 text-white" 
                    : "bg-slate-100 dark:bg-black/30 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  }`}
                >
                  <span className="text-6xl font-mono font-bold block mb-1">{currentSpeed}</span>
                  <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">km/h</p>
                </div>
              </div>

              <div className="mt-10">
                <Button 
                  size="lg"
                  onClick={() => setIsDriving(!isDriving)}
                  className={`h-20 w-full text-xl font-bold shadow-xl border-0 rounded-2xl transition-transform active:scale-95 ${
                    isDriving 
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30" 
                      : "bg-[#FFC107] hover:bg-[#ffcd38] text-slate-900 shadow-yellow-500/20"
                  }`}
                >
                  <Power className="mr-3 w-8 h-8" />
                  {isDriving ? "TERMINAR RECORRIDO" : "INICIAR RECORRIDO"}
                </Button>
              </div>
            </div>

            {/* BOTONES RÁPIDOS (Blancos sobre fondo gris) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <QuickAction 
                icon={AlertTriangle} 
                label="Tráfico" 
                color="text-orange-600" 
                // Bg blanco puro para resaltar sobre el fondo slate-100
                bg="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700" 
                onClick={() => sendAlert("🚧 Tráfico Pesado")} 
              />
              <QuickAction 
                icon={AlertTriangle} 
                label="Accidente" 
                color="text-red-600" 
                bg="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700" 
                onClick={() => sendAlert("🚑 Accidente reportado")} 
              />
              <QuickAction 
                icon={Mic} 
                label="Voceo" 
                color="text-blue-600" 
                bg="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700" 
                onClick={() => alert("Micrófono activado")} 
              />
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 transition-colors h-full flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 text-lg">
                  <Bus className="text-[#FFC107] w-6 h-6" /> Próxima Parada
                </h3>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-3 h-24 bg-slate-100 dark:bg-slate-800 rounded-full mx-2 relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1/2 bg-[#003da5] dark:bg-blue-500 rounded-full shadow-lg"></div>
                  </div>
                  <div className="space-y-6 flex-1">
                    <div className="opacity-50">
                      <p className="font-bold text-slate-800 dark:text-slate-300 text-lg">Seminario Mayor</p>
                      <p className="text-sm text-slate-500">10:45 AM</p>
                    </div>
                    <div>
                      <p className="font-bold text-2xl text-[#003da5] dark:text-blue-400 leading-tight">Facultad Ingeniería</p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-bold mt-1">Llegada en 2 min</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button className="w-full py-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-base rounded-xl shadow-sm" variant="outline" onClick={() => navigate('/driver/history')}>
                  Ver Itinerario Completo
                </Button>

                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    Reporta incidentes para mantener informada a la comunidad.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, color, bg, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-6 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${bg}`}
  >
    <Icon className={`w-10 h-10 mb-3 ${color}`} />
    <span className={`font-bold text-lg text-slate-700 dark:text-slate-200`}>{label}</span>
  </button>
);

export default DashboardPage;