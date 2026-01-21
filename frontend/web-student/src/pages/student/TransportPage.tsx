import React, { useEffect, useState } from 'react';
import { AlertCircle, Navigation, User } from 'lucide-react';

import { transportService } from '@/services/transportService';
import { getDriverById } from '@/services/driverService';
import { getRouteDetails } from '@/services/routeService';

import LiveRouteMap from '@/components/Map/LiveRouteMap';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouteSocket } from '@/hooks/useRouteSocket';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/* ======================================================
   SMALL COMPONENT
====================================================== */
const InfoCard = ({
  title,
  value,
  subtitle,
  statusColor = 'text-blue-600',
}: any) => (
  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex-1">
    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
      {title}
    </p>
    <p className="text-base font-bold text-gray-900 dark:text-white truncate">
      {value}
    </p>
    {subtitle && (
      <p className={`text-xs font-medium mt-1 ${statusColor}`}>
        {subtitle}
      </p>
    )}
  </div>
);

/* ======================================================
   PAGE
====================================================== */

const TransportPage: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  // Estados de carga
  const [loading, setLoading] = useState(true);

  // Datos principales
  const [myVehicles, setMyVehicles] = useState<any[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [driversInfo, setDriversInfo] = useState<Record<string, any>>({});

  // 🗺️ Estados del mapa
  const [activePolyline, setActivePolyline] = useState<string | null>(null);
  const [busLocation, setBusLocation] = useState<{ lat: number; lng: number } | null>(null);

  // ✅ CORRECCIÓN: Derivamos el viaje activo del estado
  const activeTrip = myVehicles.length > 0 ? myVehicles[0] : null;

  // ✅ CORRECCIÓN: Llamada única al Hook con los argumentos correctos
  // Si activeTrip es null, el hook no conectará (eso es correcto)
  const { lastMessage } = useRouteSocket(token, activeTrip?.id);

  /* ======================================================
     EFFECTS
  ====================================================== */

  useEffect(() => {
    loadData();
  }, []);

  // 📡 Escuchar ubicación del bus en tiempo real
  useEffect(() => {
    if (lastMessage && lastMessage.location) {
      // ✅ CORRECCIÓN: El backend envía 'location' con 'latitude' y 'longitude'
      // Adaptamos al formato que espera el mapa
      setBusLocation({
        lat: lastMessage.location.latitude,
        lng: lastMessage.location.longitude,
      });
    }
  }, [lastMessage]);

  /* ======================================================
     DATA LOAD
  ====================================================== */

  const loadData = async () => {
    try {
      setLoading(true);

      // 1️⃣ Mi viaje activo
      const myTransportData = await transportService.getMyVehicle();
      const myRides = Array.isArray(myTransportData)
        ? myTransportData
        : myTransportData
        ? [myTransportData]
        : [];

      setMyVehicles(myRides);

      if (myRides.length > 0) {
        const ride = myRides[0];

        // 2️⃣ Conductor
        if (ride.driver_id) {
          getDriverById(ride.driver_id).then((driver) =>
            setDriversInfo((prev) => ({
              ...prev,
              [ride.id]: driver,
            }))
          );
        }

        // 3️⃣ Ruta (Polyline)
        if (ride.route_id) {
          try {
            const route = await getRouteDetails(ride.route_id);
            setActivePolyline(route.polyline);
          } catch (err) {
            console.error('Error cargando ruta:', err);
          }
        }
      } else {
            const activeTrips = await transportService.getActiveTrips();
            setAvailableVehicles(activeTrips);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     ACTIONS
  ====================================================== */

  const handleJoin = async (vehicleId: string) => {
    try {
      await transportService.joinVehicle(vehicleId);
      toast({
        title: '¡Te has unido!',
        description: 'Viaje registrado correctamente.',
      });
      loadData();
    } catch {
      toast({
        title: 'Error',
        description: 'No pudimos asignarte.',
        variant: 'destructive',
      });
    }
  };

  const handleLeave = async (vehicleId: string) => {
    try {
      await transportService.leaveVehicle(vehicleId);
      toast({
        title: 'Viaje cancelado',
        description: 'Te has bajado de la unidad.',
      });
      setMyVehicles([]);
      setActivePolyline(null);
      setBusLocation(null);
      loadData();
    } catch {
      toast({
        title: 'Error',
        description: 'No pudimos cancelar el viaje.',
        variant: 'destructive',
      });
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */

  if (loading) {
    return (
      <div className="p-10 text-center animate-pulse">
        Cargando transporte...
      </div>
    );
  }

  // ==========================================
  // 🗺️ VISTA MAPA (Viaje Activo)
  // ==========================================
  if (myVehicles.length > 0) {
    const vehicle = myVehicles[0];
    const driver = driversInfo[vehicle.id];

    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col p-4 gap-4">
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-md border flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {driver?.name ? driver.name.charAt(0) : <User />}
            </div>
            <div>
              <h2 className="font-bold text-lg">
                {driver?.name || 'Conductor'}
              </h2>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="text-xs">
                  {vehicle.plate}
                </Badge>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Navigation size={12} /> En camino
                </span>
              </div>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Bajarme
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Deseas bajarte?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Perderás tu asiento en la unidad {vehicle.plate}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleLeave(vehicle.id)}
                  className="bg-red-600"
                >
                  Sí, bajarme
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* MAPA */}
        <div className="flex-1 rounded-2xl overflow-hidden border shadow-inner relative">
          <LiveRouteMap
            routePolyline={activePolyline}
            busLocation={busLocation}
          />

          {!activePolyline && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <p className="text-gray-500 flex items-center gap-2">
                <AlertCircle size={20} /> Esperando datos de ruta...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 📋 VISTA LISTA (Sin Viaje)
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <h3 className="font-bold">Sin transporte asignado</h3>
          <p className="text-sm">
            Selecciona una unidad para iniciar tu viaje.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableVehicles.map((bus) => (
          <div
            key={bus.id}
            className="bg-white border p-6 rounded-2xl shadow-sm"
          >
            <h3 className="text-lg font-bold">{bus.plate}</h3>
            <p className="text-sm text-gray-500 mb-4">{bus.model}</p>
            <Button
              onClick={() => handleJoin(bus.id)}
              className="w-full bg-blue-900 text-white"
            >
              Subirme a este bus
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportPage;