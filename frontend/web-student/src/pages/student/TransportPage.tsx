import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
  const [routePolyline, setRoutePolyline] = useState<string>('');

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  /* ======================================================
     📍 POSICIÓN DEL BUS (CON VALIDACIÓN ESTRICTA)
  ====================================================== */
  const defaultLocation = {
    lat: -0.2017,
    lng: -78.5057,
    heading: 0,
  };

  // ✅ Conversión y validación robusta
  const busPos = useMemo(() => {
    if (!activeRide) return defaultLocation;

    // Convertir a números explícitamente
    const lat = Number(activeRide.current_latitude);
    const lng = Number(activeRide.current_longitude);
    const heading = Number(activeRide.heading) || 0;

    // Validar que sean números válidos
    if (isNaN(lat) || isNaN(lng)) {
      console.error('❌ Coordenadas del bus inválidas:', {
        lat: activeRide.current_latitude,
        lng: activeRide.current_longitude,
      });
      return defaultLocation;
    }

    // Validar rango de Quito (seguridad adicional)
    if (lat < -1 || lat > 0 || lng < -79 || lng > -78) {
      console.warn('⚠️ Coordenadas fuera de Quito:', { lat, lng });
    }

    return { lat, lng, heading };
  }, [activeRide]);

  const isUserReady = user?.id && user.id !== 'unknown';

  /* ======================================================
     📄 SYNC GENERAL
  ====================================================== */
  const syncData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      if (isUserReady) {
        const myTrip = await transportService.getActiveTripByStudent(
          String(user.id)
        );
        setActiveRide(myTrip);
      }

      const trips = await transportService.getActiveTrips();
      setAvailableTrips(trips);
    } catch (err) {
      console.error('❌ Error sync:', err);
    } finally {
      setLoading(false);
    }
  }, [token, isUserReady, user?.id]);

  /* ======================================================
     🚀 CARGA INICIAL
  ====================================================== */
  useEffect(() => {
    if (!authLoading) {
      syncData();
    }
  }, [authLoading, syncData]);

  /* ======================================================
     🛰️ TRACKING DEL BUS
  ====================================================== */
  useEffect(() => {
    if (!activeRide || !isUserReady) return;

    console.log('🛰️ Iniciando tracking para viaje:', activeRide.id);

    const trackBus = async () => {
      try {
        const allTrips = await transportService.getActiveTrips();
        const updatedTrip = allTrips.find(
          (t: any) => String(t.id) === String(activeRide.id)
        );

        if (updatedTrip) {
          // 🔍 Debug de movimiento
          if (
            updatedTrip.current_latitude !== activeRide.current_latitude ||
            updatedTrip.current_longitude !== activeRide.current_longitude
          ) {
            console.log('🚌 Bus se movió:', {
              old: {
                lat: activeRide.current_latitude,
                lng: activeRide.current_longitude,
              },
              new: {
                lat: updatedTrip.current_latitude,
                lng: updatedTrip.current_longitude,
              },
            });
          }
          
          setActiveRide(updatedTrip);
        }
      } catch (error) {
        console.error('⚠️ Error rastreando bus:', error);
      }
    };

    trackBus();
    pollingInterval.current = setInterval(trackBus, 3000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        console.log('🛑 Tracking detenido');
      }
    };
  }, [activeRide?.id, isUserReady]);

  /* ======================================================
     🗺️ POLYLINE DE RUTA
  ====================================================== */
  useEffect(() => {
    const loadRoute = async () => {
      if (activeRide?.route_id) {
        console.log('🗺️ Cargando polyline para ruta:', activeRide.route_id);
        const poly = await transportService.getRoutePolyline(
          activeRide.route_id
        );
        
        if (poly) {
          console.log('✅ Polyline recibida, longitud:', poly.length);
          setRoutePolyline(poly);
        } else {
          console.warn('⚠️ No se recibió polyline');
          setRoutePolyline('');
        }
      } else {
        setRoutePolyline('');
      }
    };

    loadRoute();
  }, [activeRide?.route_id]);

  /* ======================================================
     🎯 ACTIONS
  ====================================================== */
  const handleJoin = async (tripId: number) => {
    if (!isUserReady) return;

    setLoading(true);
    try {
      await transportService.boardTrip(tripId, String(user.id));
      toast({ title: '¡Subido al bus!' });
      await syncData();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: 'No se pudo subir.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!activeRide) return;

    setLoading(true);
    try {
      await transportService.leaveVehicle(
        activeRide.id,
        String(user.id)
      );
      toast({ title: 'Te bajaste del bus' });
      setActiveRide(null);
      setRoutePolyline('');
      await syncData();
    } catch {
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
     🔍 DEBUG RENDER
  ====================================================== */
  console.log('🎨 TRANSPORT PAGE RENDER:', {
    hasActiveRide: !!activeRide,
    tripId: activeRide?.id,
    busPos,
    polylineLength: routePolyline?.length || 0,
  });

  /* ======================================================
     🖥️ RENDER
  ====================================================== */
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-4 space-y-4 bg-gray-50 dark:bg-slate-950">
      {activeRide ? (
        <>
          {/* 🔍 PANEL DE DEBUG */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs font-mono">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <strong>Trip ID:</strong> {activeRide.id}
              </div>
              <div>
                <strong>Lat:</strong> {busPos.lat.toFixed(6)}
              </div>
              <div>
                <strong>Lng:</strong> {busPos.lng.toFixed(6)}
              </div>
              <div>
                <strong>Polyline:</strong> {routePolyline ? `${routePolyline.length} chars` : 'Sin datos'}
              </div>
              <div>
                <strong>Heading:</strong> {busPos.heading}°
              </div>
            </div>
          </div>

          {/* INFO */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow border flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Bus className="text-blue-600" size={32} />
              <div>
                <p className="text-xs text-gray-400">Placa</p>
                <p className="font-bold text-lg">{activeRide.plate}</p>
              </div>
            </div>

            <Button variant="destructive" onClick={handleLeave} disabled={loading}>
              <LogOut size={16} className="mr-2" />
              BAJARME
            </Button>
          </div>

          {/* MAPA */}
          <div className="flex-1 rounded-3xl overflow-hidden border shadow-lg bg-slate-100">
            <LiveRouteMap
              routePolyline={routePolyline}
              busLocation={busPos}
            />
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Navigation className="text-blue-600" />
            Unidades disponibles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
            {availableTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border"
              >
                <div className="flex justify-between mb-3">
                  <strong className="text-lg">{trip.plate}</strong>
                  <Badge className="bg-green-100 text-green-700">
                    ACTIVO
                  </Badge>
                </div>

                <p className="text-sm mb-2">
                  👨‍✈️ {trip.driver_name || 'Conductor UCE'}
                </p>
                <p className="text-sm mb-4">
                  👥 {trip.current_passenger_count || 0} / {trip.max_passengers}
                </p>

                <Button
                  className="w-full"
                  onClick={() => handleJoin(trip.id)}
                  disabled={loading}
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