import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouteSocket } from '@/hooks/useRouteSocket';
import { routeService } from '@/services/routeService';
import { transportService } from '@/services/tripService'; // Asumo que tienes esto
import LiveRouteMap from '@/components/Map/LiveRouteMap'; // ✅ REUTILIZAMOS TU COMPONENTE
import { Loader2, Wifi, WifiOff, Bus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TransportPage = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  // --- Estados ---
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // --- WebSocket ---
  // Se conecta AUTOMÁTICAMENTE cuando hay un activeTrip válido (Igual que el driver)
  const { isConnected, socketLocation } = useRouteSocket(
    token, 
    activeTrip?.id || null
  );

  // Ubicación por defecto (Quito) si no hay datos del socket
  const defaultLocation = { lat: -0.2017, lng: -78.5057 };
  const busLocation = socketLocation || defaultLocation;

  // 1. Cargar lista de rutas al iniciar
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const allRoutes = await routeService.getAllRoutes();
        setRoutes(allRoutes);
      } catch (error) {
        console.error("Error cargando rutas", error);
      }
    };
    loadRoutes();
  }, []);

  // 2. Cuando el estudiante selecciona una ruta
  const handleRouteSelect = async (routeId: string) => {
    setSelectedRouteId(routeId);
    if (!routeId) {
      setActiveTrip(null);
      setRoutePolyline('');
      return;
    }

    setLoading(true);
    try {
      // A. Obtener el dibujo de la ruta (Polyline)
      const poly = await transportService.getRoutePolyline(routeId);
      setRoutePolyline(poly || '');

      // B. Buscar si hay un viaje ACTIVO en esa ruta
      // NOTA: Ajusta 'getTripsByRoute' al nombre real de tu método en transportService
      // Si no existe, suele ser un getTrips con filtro.
      const trips = await transportService.getTripsByRoute(routeId); 
      const currentTrip = trips.find((t: any) => t.status === 'ACTIVE');

      if (currentTrip) {
        setActiveTrip(currentTrip);
        toast({ 
          title: "Bus encontrado", 
          description: "Conectando a la telemetría en vivo...",
          className: "bg-green-50 border-green-200"
        });
      } else {
        setActiveTrip(null);
        toast({ 
          title: "Sin servicio", 
          description: "No hay buses circulando en esta ruta ahora.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("Error buscando viaje:", error);
      toast({ title: "Error", description: "No se pudo cargar la información de la ruta" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 p-4 gap-4">
      
      {/* === HEADER Y SELECTOR === */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Bus size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-white">Transporte Estudiantil</h1>
            <p className="text-xs text-slate-500">Selecciona tu ruta para ver el bus</p>
          </div>
        </div>

        <div className="w-full md:w-64">
          <select
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedRouteId}
            onChange={(e) => handleRouteSelect(e.target.value)}
          >
            <option value="">-- Seleccionar Ruta --</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* === ÁREA DEL MAPA (Reutilizando tu componente limpio) === */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border overflow-hidden relative">
        
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
          </div>
        )}

        {/* COMPONENTE DEL MAPA (Igual que en Driver) */}
        <LiveRouteMap
          routePolyline={routePolyline}
          busLocation={busLocation}
        />

        {/* INDICADOR DE ESTADO (Flotante) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
           {/* Estado del Socket */}
           <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold shadow-md ${
             isConnected ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400'
           }`}>
             {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
             {isConnected ? 'EN VIVO' : 'DESCONECTADO'}
           </div>
        </div>

        {/* MENSAJE SI NO HAY BUS */}
        {!activeTrip && selectedRouteId && !loading && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Esperando inicio de recorrido...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportPage;