import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { transportService } from '@/services/transportService';
import LiveRouteMap from '@/components/Map/LiveRouteMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  User,
  Bus,
  Navigation,
  LogOut,
  RefreshCw,
} from 'lucide-react';

const TransportPage: React.FC = () => {
  const { user, token, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);

  // 🗺️ Polyline de la ruta (Fuente de la Verdad)
  const [routePolyline, setRoutePolyline] = useState<string>('');

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // 📍 Posición del bus
  const defaultLocation = { lat: -0.2017, lng: -78.5057 };
  const busPos =
    activeRide?.current_latitude != null
      ? {
          lat: activeRide.current_latitude,
          lng: activeRide.current_longitude,
        }
      : defaultLocation;

  // 🛡️ Usuario válido
  const isUserReady = user?.id && user.id !== 'unknown';

  /* ======================================================
     🔄 SYNC GENERAL
  ====================================================== */
  const syncData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      console.log('🔄 [UI] Sincronizando datos...');

      if (isUserReady) {
        const myTrip = await transportService.getActiveTripByStudent(
          String(user.id)
        );
        setActiveRide(myTrip);
      }

      const trips = await transportService.getActiveTrips();
      setAvailableTrips(trips);
    } catch (err) {
      console.error('❌ [UI] Error sync:', err);
    } finally {
      setLoading(false);
    }
  }, [token, isUserReady, user?.id]);

  /* ======================================================
     🚀 EFECTO INICIAL
  ====================================================== */
  useEffect(() => {
    if (!authLoading) {
      syncData();
    }
  }, [authLoading, syncData]);

  /* ======================================================
     🔄 POLLING DE UBICACIÓN DEL BUS (FIX ID)
  ====================================================== */
  useEffect(() => {
    if (activeRide && isUserReady) {
      console.log(
        '🛰️ Iniciando radar de seguimiento para Viaje:',
        activeRide.id
      );

      const trackBus = async () => {
        try {
          const allTrips = await transportService.getActiveTrips();

          const updatedTrip = allTrips.find(
            (t: any) => String(t.id) === String(activeRide.id)
          );

          if (updatedTrip) {
            if (
              updatedTrip.current_latitude !==
                activeRide.current_latitude ||
              updatedTrip.current_longitude !==
                activeRide.current_longitude
            ) {
              console.log(
                '🚌 Bus se movió:',
                updatedTrip.current_latitude,
                updatedTrip.current_longitude
              );
              setActiveRide(updatedTrip);
            }
          }
        } catch (error) {
          console.error('⚠️ Error rastreando bus:', error);
        }
      };

      trackBus();
      pollingInterval.current = setInterval(trackBus, 3000);
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        console.log('🛑 Radar detenido');
      }
    };
  }, [activeRide?.id, isUserReady, user?.id]);

  /* ======================================================
     🗺️ CARGA DE POLYLINE DE RUTA
  ====================================================== */
  useEffect(() => {
    const loadRoute = async () => {
      if (activeRide?.route_id) {
        console.log('🗺️ Cargando polyline de ruta:', activeRide.route_id);
        const poly = await transportService.getRoutePolyline(
          activeRide.route_id
        );
        if (poly) {
          setRoutePolyline(poly);
        }
      } else {
        setRoutePolyline('');
      }
    };

    loadRoute();
  }, [activeRide?.route_id]);

  /* ======================================================
     🎯 HANDLERS
  ====================================================== */
  const handleJoin = async (tripId: number) => {
    if (!isUserReady) {
      toast({
        title: 'Cargando perfil...',
        description:
          'Estamos verificando tu identidad. Intenta en unos segundos.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await transportService.boardTrip(tripId, String(user.id));
      toast({
        title: '¡Subido!',
        description: 'Has abordado el bus correctamente.',
      });
      await syncData();
    } catch (e: any) {
      const msg =
        e.response?.data?.detail?.[0]?.msg ||
        e.response?.data?.detail ||
        'Error al subir.';
      toast({
        title: 'No se pudo subir',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!activeRide || !isUserReady) return;

    setLoading(true);
    try {
      await transportService.leaveVehicle(
        activeRide.id,
        String(user.id)
      );
      toast({ title: 'Bajada registrada' });
      setActiveRide(null);
      setRoutePolyline('');
      await syncData();
    } catch (e) {
      toast({
        title: 'Error',
        description: 'No se pudo bajar.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     🔍 DEBUG FINAL — JUSTO ANTES DEL RENDER
  ====================================================== */
  console.log('🔍 RENDER DEBUG:', {
    id: activeRide?.id,
    lat: activeRide?.current_latitude,
    lng: activeRide?.current_longitude,
    polylineLen: routePolyline?.length,
  });

  /* ======================================================
     🖥️ RENDER
  ====================================================== */
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col p-4 space-y-4 bg-gray-50 dark:bg-slate-950">
      {/* HEADER */}
      <div
        className={`flex justify-between items-center p-2 rounded-lg text-xs ${
          isUserReady
            ? 'bg-green-50 text-green-800'
            : 'bg-orange-50 text-orange-800'
        }`}
      >
        <span className="flex items-center gap-2">
          {isUserReady ? (
            <User size={14} />
          ) : (
            <Loader2 size={14} className="animate-spin" />
          )}
          {isUserReady
            ? `Usuario: ${user?.name}`
            : 'Cargando perfil de estudiante...'}
        </span>

        <Button size="sm" variant="ghost" onClick={syncData}>
          <RefreshCw
            size={12}
            className={loading ? 'animate-spin' : ''}
          />
        </Button>
      </div>

      {activeRide ? (
        <>
          {/* INFO VIAJE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                <User size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">
                  Conductor
                </p>
                <h3 className="font-bold text-sm">
                  {activeRide.driver_name || 'UCE Driver'}
                </h3>
              </div>

              <div className="w-px h-8 bg-gray-200" />

              <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
                <Bus size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">
                  Placa
                </p>
                <h3 className="font-bold text-sm">
                  {activeRide.plate}
                </h3>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={loading}
            >
              <LogOut size={18} className="mr-2" />
              BAJARME
            </Button>
          </div>

          {/* MAPA */}
          <div className="flex-1 rounded-3xl overflow-hidden border shadow-lg">
            <LiveRouteMap
              routePolyline={routePolyline}
              busLocation={busPos}
            />
          </div>
        </>
      ) : (
        <>
          {/* LISTA DE UNIDADES */}
          <h2 className="text-2xl font-black flex items-center gap-2 px-1">
            <Navigation className="text-blue-600" />
            Unidades Disponibles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
            {availableTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-slate-900 border p-5 rounded-[24px]"
              >
                <div className="flex justify-between mb-4">
                  <div className="bg-slate-900 text-white px-3 py-1 rounded-xl font-black">
                    {trip.plate}
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    ACTIVO
                  </Badge>
                </div>

                <p>👨‍✈️ {trip.driver_name || 'Conductor UCE'}</p>
                <p>
                  💺 {trip.current_passenger_count || 0} /{' '}
                  {trip.max_passengers}
                </p>

                <Button
                  className="w-full mt-4"
                  onClick={() => handleJoin(trip.id)}
                  disabled={!isUserReady || loading}
                >
                  SUBIRME
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TransportPage;
