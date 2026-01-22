import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { transportService } from '@/services/transportService';
import LiveRouteMap from '@/components/Map/LiveRouteMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Bus, Navigation, LogOut, RefreshCw } from 'lucide-react';

const TransportPage: React.FC = () => {
  // Obtenemos métodos extra de Auth si existen (como checkUser o refreshProfile)
  const { user, token, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);

  // 📍 Coordenadas UCE
  const defaultLocation = { lat: -0.2017, lng: -78.5057 };
  const busPos = activeRide?.current_latitude 
    ? { lat: activeRide.current_latitude, lng: activeRide.current_longitude }
    : defaultLocation;

  // 🛡️ VERIFICADOR DE USUARIO REAL
  // Si user.id es 'unknown' o null, no es un usuario válido para abordar
  const isUserReady = user?.id && user.id !== 'unknown';

  const syncData = useCallback(async () => {
    if (!token) return; 

    setLoading(true);
    try {
      console.log("🔄 [UI] Sincronizando datos...");
      
      // Solo buscamos viaje propio si sabemos quién es el usuario
      if (isUserReady) {
        const myTrip = await transportService.getActiveTripByStudent(String(user.id));
        setActiveRide(myTrip);
      }

      // Siempre cargamos la lista de buses (esto funciona aunque seas 'unknown')
      const trips = await transportService.getActiveTrips();
      setAvailableTrips(trips);
      
    } catch (err) {
      console.error("❌ [UI] Error sync:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, isUserReady]);

  // 🔥 EFECTO INICIAL
  useEffect(() => {
    if (!authLoading) {
      syncData();
    }
  }, [authLoading, user?.id, syncData]);

  // === HANDLERS ===

  const handleJoin = async (tripId: number) => {
    // 🛑 BLOQUEO DE SEGURIDAD EN LA UI
    if (!isUserReady) {
      toast({
        title: 'Cargando perfil...',
        description: 'Estamos verificando tu identidad. Intenta en unos segundos.',
        variant: 'destructive' // O warning
      });
      // Aquí podrías forzar un window.location.reload() si el auth está muy roto
      console.warn("⛔ Intento de abordaje bloqueado: Usuario unknown");
      return;
    }

    setLoading(true);
    try {
      console.log(`👤 Subiendo usuario: ${user.id} al viaje ${tripId}`);
      await transportService.boardTrip(tripId, String(user.id));
      toast({ title: '¡Subido!', description: 'Has abordado el bus correctamente.' });
      await syncData();
    } catch (e: any) {
      // Mensaje de error amigable
      const msg = e.response?.data?.detail?.[0]?.msg || e.response?.data?.detail || 'Error al subir.';
      toast({ title: 'No se pudo subir', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!activeRide || !isUserReady) return;
    setLoading(true);
    try {
      await transportService.leaveVehicle(activeRide.id, String(user.id));
      toast({ title: 'Bajada registrada' });
      setActiveRide(null);
      await syncData();
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo bajar.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // === RENDER ===
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col p-4 space-y-4 bg-gray-50 dark:bg-slate-950 relative">
      
      {/* HEADER DE ESTADO (Para Debug) */}
      <div className={`flex justify-between items-center p-2 rounded-lg text-xs ${isUserReady ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
        <span className="flex items-center gap-2">
          {isUserReady ? <User size={14}/> : <Loader2 size={14} className="animate-spin"/>}
          {isUserReady ? `Usuario: ${user.name}` : 'Cargando perfil de estudiante...'}
        </span>
        <Button size="sm" variant="ghost" onClick={syncData} className="h-6 text-xs">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {activeRide ? (
        // VISTA EN RUTA
        <>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><User size={24} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Conductor</p>
                <h3 className="font-bold text-sm">{activeRide.driver_name || 'UCE Driver'}</h3>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600"><Bus size={24} /></div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-gray-400">Placa</p>
                 <h3 className="font-bold text-sm">{activeRide.plate}</h3>
              </div>
            </div>
            <Button variant="destructive" onClick={handleLeave} className="font-bold shadow-red-100 shadow-lg" disabled={!isUserReady || loading}>
              <LogOut size={18} className="mr-2" /> BAJARME
            </Button>
          </div>
          <div className="flex-1 rounded-3xl overflow-hidden border shadow-lg relative">
            <LiveRouteMap routePolyline={activeRide.polyline} busLocation={busPos} />
          </div>
        </>
      ) : (
        // VISTA LISTA
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 px-1">
            <Navigation className="text-blue-600" /> Unidades Disponibles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20 pr-2">
            {availableTrips.length > 0 ? (
              availableTrips.map((trip) => (
                <div key={trip.id} className="bg-white dark:bg-slate-900 border p-5 rounded-[24px] shadow-sm hover:border-blue-400 transition-all">
                  <div className="flex justify-between mb-4">
                    <div className="bg-slate-900 text-white px-3 py-1 rounded-xl font-black">{trip.plate}</div>
                    <Badge className="bg-green-100 text-green-700">ACTIVO</Badge>
                  </div>
                  <div className="mb-4 text-sm space-y-1 text-gray-600">
                    <p>👨‍✈️ {trip.driver_name || 'Conductor UCE'}</p>
                    <p>💺 {trip.current_passenger_count || 0} / {trip.max_passengers || 45}</p>
                  </div>
                  
                  {/* Botón que se deshabilita si no hay usuario */}
                  <Button 
                    onClick={() => handleJoin(trip.id)} 
                    className="w-full bg-blue-600 text-white font-bold rounded-xl h-12 disabled:opacity-50"
                    disabled={loading || !isUserReady} // <--- AQUÍ ESTÁ LA CLAVE
                  >
                    {!isUserReady ? 'Cargando usuario...' : 'SUBIRME'}
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center opacity-60">
                <Bus size={64} className="mx-auto mb-4 text-slate-300" />
                <p className="font-bold">No hay unidades en ruta</p>
                <Button variant="link" onClick={syncData}>Refrescar</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportPage;