import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, Bus, Navigation, Bell, Wallet, 
  AlertTriangle, Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button'; 

const DashboardPage = () => {
  const navigate = useNavigate();
  const userName = "Estudiante"; // Podrías sacarlo del useAuth()

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-fade-in pb-20">
      
      {/* Header de Bienvenida */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hola, {userName} 👋</h1>
          <p className="text-gray-500">Aquí tienes el resumen de tu transporte hoy.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold hidden md:block">
          📅 {new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: TARJETA PRINCIPAL (PRÓXIMO BUS) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-[#003da5] to-[#002a7a] rounded-3xl p-6 text-white shadow-lg overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:translate-x-5 transition-transform"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                  <Bus className="w-8 h-8 text-white" />
                </div>
                <span className="bg-green-500/20 text-green-100 border border-green-400/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  En Camino
                </span>
              </div>
              
              <div className="space-y-1 mb-8">
                <p className="text-blue-100 text-sm font-medium">Ruta Asignada</p>
                <h2 className="text-3xl font-bold">Ruta Norte - Carcelén</h2>
                <p className="text-blue-200 text-sm flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4" /> Llega en 5 minutos
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/student/tracking')}
                  className="bg-white text-[#003da5] hover:bg-blue-50 border-0 font-bold"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Ver Mapa en Vivo
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-transparent border-white/30 text-white hover:bg-white/10"
                  onClick={() => navigate('/student/transport')}
                >
                  Detalles
                </Button>
              </div>
            </div>
          </div>

          {/* ACCESOS RÁPIDOS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction 
              icon={MapPin} label="Rutas" color="text-blue-600" bg="bg-blue-50" 
              onClick={() => navigate('/student/routes')} 
            />
            <QuickAction 
              icon={Wallet} label="Pagos" color="text-green-600" bg="bg-green-50" 
              onClick={() => navigate('/student/payments')} 
            />
            <QuickAction 
              icon={Calendar} label="Historial" color="text-purple-600" bg="bg-purple-50" 
              onClick={() => navigate('/student/history')} 
            />
            <QuickAction 
              icon={AlertTriangle} label="Reportar" color="text-orange-600" bg="bg-orange-50" 
              onClick={() => navigate('/student/notifications')} 
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: NOTIFICACIONES Y ESTADO */}
        <div className="space-y-6">
          {/* Widget de Saldo */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Saldo Disponible</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">$12.50</span>
              <Button variant="link" size="sm" className="text-blue-600 h-auto p-0" onClick={() => navigate('/student/payments')}>
                Recargar
              </Button>
            </div>
          </div>

          {/* Widget de Avisos */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Avisos Recientes</h3>
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-4">
              {[
                { title: 'Cambio de Ruta', desc: 'Desvío en Av. Patria por obras.', time: 'Hace 2h', color: 'bg-orange-100 text-orange-600' },
                { title: 'Pago Confirmado', desc: 'Recarga de $5.00 exitosa.', time: 'Ayer', color: 'bg-green-100 text-green-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Componente auxiliar pequeño
const QuickAction = ({ icon: Icon, label, color, bg, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
  >
    <div className={`w-10 h-10 ${bg} ${color} rounded-full flex items-center justify-center mb-2`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</span>
  </button>
);

export default DashboardPage;