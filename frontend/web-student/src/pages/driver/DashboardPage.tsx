import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  Play,
  CheckCircle,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouteSocket } from '@/hooks/useRouteSocket';
import { transportService } from '@/services/tripService';
import { vehicleService } from '@/services/vehicleService';
import { routeService } from '@/services/routeService';
import { simulationService } from '@/services/simulationService';
import { driverService, DriverProfile } from '@/services/driverService';
import LiveRouteMap from '@/components/Map/LiveRouteMap';
import { useToast } from '@/hooks/use-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  // Estados
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [routePolyline, setRoutePolyline] = useState<string>('');

  // 🔑 WebSocket - SIEMPRE conectado cuando hay viaje activo
  const { isConnected, socketLocation } = useRouteSocket(
    token,
    activeTrip?.id || null
  );

  // 📍 Ubicación por defecto (solo si no hay WebSocket)
  const defaultLocation = { lat: -0.2017, lng: -78.5057 };

  // 🎯 Ubicación REAL del bus (prioridad: WebSocket > Default)
  const busLocation = socketLocation || defaultLocation;

  /* ======================================================
     CARGA INICIAL
  ====================================================== */
  const loadInitialData = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No hay usuario autenticado');
      return;
    }

    setLoading(true);

    try {
      console.log('='.repeat(60));
      console.log('🚀 CARGANDO DASHBOARD DE CONDUCTOR');
      console.log('='.repeat(60));

      // 1. Perfil del conductor
      let profile: DriverProfile;

      try {
        profile = await driverService.getDriverProfile();
        setDriverProfile(profile);
        console.log('✅ Perfil obtenido:', {
          driver_id: profile.id,
          name: profile.name,
        });
      } catch (error: any) {
        console.error('❌ Error obteniendo perfil:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar perfil',
          description: 'No se pudo obtener información del conductor',
        });
        setLoading(false);
        return;
      }

      // 2. Vehículo asignado
      const assignedVehicle = await vehicleService.getVehicleByDriver(profile.id);
      
      if (assignedVehicle) {
        setVehicle(assignedVehicle);
        console.log('✅ Vehículo asignado:', assignedVehicle.plate);
      } else {
        const allVehicles = await vehicleService.getAllVehicles();
        const available = allVehicles.filter((v: any) => !v.driver_id);
        setAvailableVehicles(available);
        console.log('⚠️ Sin vehículo. Disponibles:', available.length);
      }

      // 3. Rutas disponibles
      const allRoutes = await routeService.getAllRoutes();
      setRoutes(allRoutes);
      console.log('✅ Rutas cargadas:', allRoutes.length);

      // 4. Viaje activo
      const trip = await transportService.getActiveTripByDriver(profile.id);

      if (trip && trip.status !== 'COMPLETED') {
        console.log('✅ Viaje activo encontrado:', {
          trip_id: trip.id,
          status: trip.status,
        });

        setActiveTrip(trip);

        // Cargar polyline de la ruta
        if (trip.route_id) {
          const poly = await transportService.getRoutePolyline(trip.route_id);
          if (poly) {
            setRoutePolyline(poly);
            console.log('✅ Polyline cargada');
          }
        }
      } else {
        console.log('⚠️ Sin viaje activo');
      }

      console.log('='.repeat(60));
      console.log('✅ DASHBOARD CARGADO');
      console.log('='.repeat(60));

    } catch (error: any) {
      console.error('❌ Error cargando dashboard:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar dashboard',
        description: error.message || 'Intenta recargar la página',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /* ======================================================
     DEBUG: Mostrar ubicación del bus en consola
  ====================================================== */
  useEffect(() => {
    if (socketLocation && isConnected) {
      console.log('🚌 BUS ACTUALIZADO:', {
        lat: socketLocation.lat,
        lng: socketLocation.lng,
        heading: socketLocation.heading,
        speed: socketLocation.speed,
      });
    }
  }, [socketLocation, isConnected]);

  /* ======================================================
     INICIAR VIAJE
  ====================================================== */
  const handleStartTrip = async () => {
    if (activeTrip) {
      return toast({
        variant: 'destructive',
        title: 'Viaje en curso',
        description: 'Finaliza el viaje actual primero',
      });
    }

    if (!selectedRouteId || !vehicle || !driverProfile) {
      return toast({
        variant: 'destructive',
        title: 'Datos incompletos',
        description: 'Selecciona vehículo y ruta',
      });
    }

    try {
      console.log('='.repeat(60));
      console.log('🚀 INICIANDO VIAJE');
      console.log('='.repeat(60));

      // 1. Crear viaje
      const tripData = {
        route_id: selectedRouteId,
        vehicle_id: vehicle.id,
        driver_id: driverProfile.id,
      };

      const newTrip = await transportService.createTrip(tripData);
      console.log('✅ Viaje creado:', newTrip.id);

      // 2. Iniciar viaje (cambiar estado a ACTIVE)
      const startedTrip = await transportService.startTrip(newTrip.id);
      console.log('✅ Viaje activado:', startedTrip.id);

      // 3. Iniciar simulación
      await simulationService.start({
        trip_id: startedTrip.id,
        route_id: selectedRouteId,
        driver_id: driverProfile.id,
      });
      console.log('✅ Simulación iniciada');

      // 4. Cargar polyline
      const poly = await transportService.getRoutePolyline(selectedRouteId);
      if (poly) {
        setRoutePolyline(poly);
        console.log('✅ Polyline cargada');
      }

      // 5. Actualizar estado local
      setActiveTrip(startedTrip);

      console.log('='.repeat(60));
      console.log('✅ VIAJE INICIADO EXITOSAMENTE');
      console.log('='.repeat(60));

      toast({
        title: '🚌 ¡En marcha!',
        description: 'La telemetría está transmitiendo',
      });

    } catch (error: any) {
      console.error('❌ Error al iniciar viaje:', error);
      toast({
        variant: 'destructive',
        title: 'Error de conexión',
        description: error.response?.data?.detail || 'Revisa los microservicios',
      });
    }
  };

  /* ======================================================
     FINALIZAR VIAJE
  ====================================================== */
  const handleCompleteTrip = async () => {
    if (!activeTrip) return;

    try {
      console.log('='.repeat(60));
      console.log('🏁 FINALIZANDO VIAJE');
      console.log('='.repeat(60));

      // 1. Detener simulación
      try {
        await simulationService.stop(activeTrip.id);
        console.log('✅ Simulación detenida');
      } catch (simError) {
        console.warn('⚠️ Simulación ya estaba detenida');
      }

      // 2. Completar viaje
      await transportService.completeTrip(activeTrip.id);
      console.log('✅ Viaje completado');

      // 3. Limpiar estado
      setActiveTrip(null);
      setSelectedRouteId('');
      setRoutePolyline('');

      console.log('='.repeat(60));
      console.log('✅ VIAJE FINALIZADO');
      console.log('='.repeat(60));

      toast({
        title: '🏁 Viaje finalizado',
        description: 'El viaje se completó exitosamente',
      });

    } catch (error: any) {
      console.error('❌ Error al finalizar viaje:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Intenta nuevamente',
      });
      // Limpiar de todas formas
      setActiveTrip(null);
    }
  };

  /* ======================================================
     RENDERIZADO
  ====================================================== */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-200">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] p-4 bg-slate-200 dark:bg-slate-950">
      {/* ==========================================
          🗺️ MAPA Y TELEMETRÍA
      ========================================== */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-lg border relative">
        {/* 🔑 PASAMOS socketLocation AL MAPA */}
        <LiveRouteMap
          routePolyline={routePolyline}
          busLocation={busLocation} // ✅ ESTO ES LO QUE ESTABA MAL
        />

        {/* Estado de conexión */}
        <div className="absolute top-6 right-6 z-20">
          <div
            className={`px-4 py-2 rounded-full flex items-center gap-2 font-bold text-[10px] shadow-md ${
              isConnected
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isConnected ? 'SISTEMA ONLINE' : 'TELEMETRÍA OFFLINE'}
          </div>
        </div>

        {/* Info del conductor */}
        {driverProfile && (
          <div className="absolute top-6 left-6 z-20">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <p className="text-xs font-bold text-gray-600">
                {driverProfile.name}
              </p>
            </div>
          </div>
        )}

        {/* 🔍 DEBUG: Mostrar coordenadas actuales */}
        {socketLocation && (
          <div className="absolute bottom-6 left-6 z-20 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono">
            <div>Lat: {socketLocation.lat.toFixed(6)}</div>
            <div>Lng: {socketLocation.lng.toFixed(6)}</div>
            <div>Heading: {socketLocation.heading?.toFixed(1)}°</div>
            <div>Speed: {socketLocation.speed?.toFixed(1)} km/h</div>
          </div>
        )}
      </div>

      {/* ==========================================
          🎛️ PANEL DE CONTROL
      ========================================== */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border">
          <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">
            Control de Misión
          </h3>

          {!vehicle ? (
            /* SIN VEHÍCULO */
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500">
                Debes vincular una unidad:
              </p>
              {availableVehicles.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No hay vehículos disponibles
                </p>
              ) : (
                availableVehicles.map((v) => (
                  <Button
                    key={v.id}
                    onClick={async () => {
                      try {
                        await vehicleService.claimVehicle(v.id);
                        toast({
                          title: 'Vehículo asignado',
                          description: `Unidad ${v.plate} vinculada`,
                        });
                        await loadInitialData();
                      } catch (error) {
                        toast({
                          variant: 'destructive',
                          title: 'Error',
                          description: 'No se pudo vincular el vehículo',
                        });
                      }
                    }}
                    className="w-full justify-between h-14 rounded-2xl"
                  >
                    <span className="font-bold">{v.plate}</span>
                    <Bus size={18} />
                  </Button>
                ))
              )}
            </div>
          ) : !activeTrip ? (
            /* CON VEHÍCULO: INICIO DE VIAJE */
            <div className="space-y-4">
              {/* Info del vehículo */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 flex items-center gap-3">
                <Bus className="text-blue-600" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Vehículo
                  </p>
                  <p className="text-sm font-black text-blue-600">
                    {vehicle.plate}
                  </p>
                </div>
              </div>

              {/* Selector de ruta */}
              <select
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm font-bold"
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
              >
                <option value="">Seleccionar Ruta...</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Botón de inicio */}
              <Button
                onClick={handleStartTrip}
                disabled={!selectedRouteId}
                className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-lg shadow-xl"
              >
                <Play className="mr-2" size={24} />
                INICIAR VIAJE
              </Button>
            </div>
          ) : (
            /* VIAJE EN CURSO */
            <div className="space-y-4">
              {/* Indicador de transmisión */}
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-3xl border border-green-200 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-green-600 font-black text-xs">
                    TRANSMITIENDO EN VIVO
                  </p>
                </div>
                <p className="text-slate-400 text-[10px]">
                  Trip ID: #{activeTrip.id}
                </p>
              </div>

              {/* Botón de finalización */}
              <Button
                onClick={handleCompleteTrip}
                variant="destructive"
                className="w-full h-14 rounded-2xl font-bold"
              >
                <CheckCircle className="mr-2" />
                FINALIZAR RUTA
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;