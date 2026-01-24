import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouteSocket } from '@/hooks/useRouteSocket';
import { routeService } from '@/services/routeService';
import { transportService } from '@/services/tripService';
import { driverService } from '@/services/driverService';
import { vehicleService } from '@/services/vehicleService';
import LiveRouteMap from '@/components/Map/LiveRouteMap';
import RideNotification from '@/components/RideNotification';
import { 
  Bus, Wifi, WifiOff, Gauge, User, Clock, MapPin, 
  UserPlus, UserCheck, Star, Navigation 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const TransportPage = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  // --- Estados ---
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState('');
  const [isBoarded, setIsBoarded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Datos del viaje
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);

  // Notificaciones Flotantes
  const [notifications, setNotifications] = useState<any[]>([]);

  // --- WebSocket ---
  // Ahora el hook nos devuelve 'lastNotification' también
  const { isConnected, socketLocation, lastNotification } = useRouteSocket(
    token,
    activeTrip?.id || null
  );

  const defaultLocation = { lat: -0.2017, lng: -78.5057 };
  const busLocation = socketLocation || defaultLocation;

  // --- Manejo de Notificaciones ---
  const showNotification = (type: 'success' | 'warning' | 'info' | 'error', title: string, message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 👂 EFECTO: Escuchar Alertas del Backend
  useEffect(() => {
    if (lastNotification) {
      // Mapear tipos de evento a estilos visuales
      const typeMap: any = {
        'traffic_alert': 'warning',
        'trip.cancelled': 'error',
        'trip.finished': 'success',
        'default': 'info'
      };
      
      const type = typeMap[lastNotification.event_type] || 'info';
      showNotification(type, lastNotification.title || 'Aviso', lastNotification.message);
    }
  }, [lastNotification]);

  // --- Carga Inicial ---
  useEffect(() => {
    const loadRoutes = async () => {
        try {
            const data = await routeService.getAllRoutes();
            setRoutes(data);
        } catch (error) {
            console.error("Error rutas:", error);
        }
    };
    loadRoutes();
  }, []);

  const loadTripDetails = async (trip: any) => {
    setLoadingDetails(true);
    try {
        // Mocks mientras conectas servicios
        setDriverInfo({ name: 'Vinicio (Conductor)', license: 'TYPE-E-2024', rating: 4.8 });
        setVehicleInfo({ plate: 'PCE-4952', model: 'Mercedes Benz', capacity: 45, wifi: true });
    } finally {
        setLoadingDetails(false);
    }
  };

  const handleRouteSelect = async (routeId: string) => {
    setSelectedRouteId(routeId);
    setDriverInfo(null);
    setVehicleInfo(null);
    setIsBoarded(false);

    if (!routeId) {
        setActiveTrip(null);
        setRoutePolyline('');
        return;
    }

    try {
        const poly = await transportService.getRoutePolyline(routeId);
        setRoutePolyline(poly || '');

        const trips = await transportService.getTripsByRoute(routeId);
        const currentTrip = trips.find((t: any) => t.status === 'ACTIVE' || t.status === 'IN_PROGRESS');

        if (!currentTrip) {
          setActiveTrip(null);
          showNotification('info', 'Ruta en espera', 'No hay unidades activas en esta ruta.');
          return;
        }

        setActiveTrip(currentTrip);
        await loadTripDetails(currentTrip);
        showNotification('success', 'Unidad Encontrada', 'Conexión satelital establecida.');

    } catch (error) {
        showNotification('error', 'Error', 'No se pudo cargar la ruta.');
    }
  };

  const handleBoardTrip = async () => {
    if (!activeTrip) return;
    try {
        await transportService.boardTrip(activeTrip.id, user.id);
        setIsBoarded(true);
        showNotification('success', '¡Bienvenido a bordo!', 'Tu viaje ha sido registrado.');
    } catch (error) {
        showNotification('error', 'Error', 'No se pudo registrar el abordaje.');
    }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'ACTIVE': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Esperando</span>;
          case 'IN_PROGRESS': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">En Ruta</span>;
          default: return <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">--</span>;
      }
  };

  return (
    <div className="h-[calc(100vh-6rem)] p-4 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 bg-slate-100 dark:bg-slate-950 transition-colors animate-fade-in relative">
      
      {/* CONTENEDOR DE NOTIFICACIONES */}
      <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map((notif) => (
          <div key={notif.id} className="pointer-events-auto">
            <RideNotification
              id={notif.id}
              type={notif.type}
              title={notif.title}
              message={notif.message}
              onClose={() => removeNotification(notif.id)}
            />
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <aside className="space-y-5 overflow-y-auto pr-1 custom-scrollbar">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">Rastreo Satelital</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sistema UCE Safe Ride</p>
            </div>
          </div>
          <div className="relative">
             <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-700 dark:text-white outline-none cursor-pointer"
                value={selectedRouteId}
                onChange={(e) => handleRouteSelect(e.target.value)}
              >
                <option value="">-- Seleccionar Ruta --</option>
                {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Navigation size={16} /></div>
          </div>
        </div>

        {activeTrip ? (
            <>
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><User size={24} className="text-slate-400"/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Operador</p>
                        <p className="font-bold text-slate-900 dark:text-white">{driverInfo?.name || 'Cargando...'}</p>
                    </div>
                </div>
                <div className="bg-blue-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div><p className="text-blue-200 text-xs font-bold uppercase mb-1">Estado</p>{getStatusBadge(activeTrip.status)}</div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />} {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div><p className="text-blue-300 text-xs mb-1 flex items-center gap-1"><Gauge size={12}/> Velocidad</p><p className="text-3xl font-black">{socketLocation?.speed?.toFixed(0) || 0} km/h</p></div>
                        <div><p className="text-blue-300 text-xs mb-1 flex items-center gap-1"><Clock size={12}/> Tiempo</p><p className="text-3xl font-black">-- min</p></div>
                    </div>
                </div>
            </>
        ) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 border border-dashed border-slate-300 text-center">
                <p className="text-slate-500 text-sm font-medium">Selecciona una ruta</p>
            </div>
        )}
      </aside>

      {/* MAPA PRINCIPAL */}
      <main className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <LiveRouteMap routePolyline={routePolyline} busLocation={busLocation} />
        {activeTrip && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                {!isBoarded ? (
                    <Button onClick={handleBoardTrip} className="h-16 pl-6 pr-8 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-xl flex items-center gap-3 animate-bounce-slow">
                        <UserPlus size={20} /> ABORDAR UNIDAD
                    </Button>
                ) : (
                    <div className="bg-white/90 backdrop-blur-md p-2 pr-6 rounded-full shadow-xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><UserCheck size={24} /></div>
                        <div><p className="font-black text-slate-800 leading-none">Estás a bordo</p><p className="text-xs text-green-600 font-medium">Viaje seguro</p></div>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default TransportPage;