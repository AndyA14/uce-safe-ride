import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Bus, Navigation, Bell } from 'lucide-react';
import {Button} from '@/components/ui/button'; // Asegúrate de que apunte a tu componente Button real

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] animate-fade-in pb-2">

      {/* IZQUIERDA: MAPA Y ACCIÓN PRINCIPAL */}
      <div className="flex-1 relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 min-h-[500px] lg:min-h-0 transition-colors group">
        
        {/* Placeholder del Mapa (Fondo) */}
        <div className="absolute inset-0 bg-gray-100 dark:bg-slate-800">
             <div className="w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>

        {/* Tarjeta flotante (Info Bus Actual) */}
        <div className="absolute top-6 left-6 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-4 shadow-lg w-80 border border-gray-100 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-700 dark:text-yellow-400 shrink-0">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Ruta Norte - Bus 12</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Conductor: Carlos Mendoza</p>
              <div className="flex items-center gap-3 mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Clock className="w-3 h-3" /> 5 min
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Av. América
                </span>
              </div>
            </div>
          </div>
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-3/4 rounded-full" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">75% del trayecto completado</p>
          </div>
        </div>

        {/* Botones Flotantes Inferiores */}
        <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-3">
          <Button 
            className="flex-1 h-12 rounded-xl shadow-xl font-bold tracking-wide"
            onClick={() => navigate('/student/tracking')} // Navegación real
          >
            <Navigation className="w-4 h-4 mr-2" />
            Ver Mapa en Vivo
          </Button>

          <Button
            variant="secondary"
            className="h-12 w-12 rounded-xl shadow-xl p-0 flex items-center justify-center relative bg-white hover:bg-gray-50"
            onClick={() => navigate('/student/notifications')}
          >
            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* DERECHA: PANEL INFORMATIVO */}
      <div className="w-full lg:w-96 flex flex-col gap-6 h-full">

        {/* Rutas disponibles */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white">Rutas Activas</h3>
            <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => navigate('/student/routes')}>Ver todas</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Ruta Norte', buses: 3, color: 'bg-blue-600' },
              { name: 'Ruta Sur', buses: 2, color: 'bg-green-500' },
              { name: 'Ruta Centro', buses: 4, color: 'bg-yellow-400' },
            ].map((route, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => navigate('/student/routes')}
              >
                <div className={`w-3 h-3 rounded-full ${route.color} shadow-sm`} />
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{route.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{route.buses} buses activos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4 shrink-0">Historial Reciente</h3>
          <div className="overflow-y-auto space-y-6 relative border-l-2 border-gray-100 dark:border-slate-800 ml-2 h-full pl-6">
            {[
              { title: 'Viaje completado', desc: 'Ruta Norte • Hace 2 horas', color: 'bg-green-500' },
              { title: 'Alerta de tráfico', desc: 'Av. Universitaria • Ayer', color: 'bg-red-400' },
              { title: 'Registro exitoso', desc: 'Bienvenido a UCE Safe Ride', color: 'bg-blue-400' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full ${item.color} border-2 border-white dark:border-slate-900 ring-1 ring-gray-100`} />
                <p className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;