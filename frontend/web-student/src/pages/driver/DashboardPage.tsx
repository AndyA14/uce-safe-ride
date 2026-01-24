import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  CheckCircle,
  Wifi,
  WifiOff,
  Loader2,
  Bus,
  MapPin,
  Navigation,
  Users,
  Gauge,
  Power,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouteSocket } from "@/hooks/useRouteSocket";
import { transportService } from "@/services/tripService";
import { vehicleService } from "@/services/vehicleService";
import { routeService } from "@/services/routeService";
import { simulationService } from "@/services/simulationService";
import { driverService, DriverProfile } from "@/services/driverService";
import LiveRouteMap from "@/components/Map/LiveRouteMap";
import { useToast } from "@/hooks/use-toast";

type TripState = "CONFIG" | "BOARDING" | "IN_ROUTE" | "IDLE";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  // --- ESTADOS ---
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [routePolyline, setRoutePolyline] = useState("");
  const [tripState, setTripState] = useState<TripState>("IDLE");
  
  // Mock de pasajeros para efecto visual
  const [passengerCount, setPassengerCount] = useState(0);

  // --- SOCKET ---
  const { isConnected, socketLocation } = useRouteSocket(
    token,
    activeTrip?.id || null
  );

  const defaultLocation = { lat: -0.2017, lng: -78.5057 };
  const busLocation = socketLocation || defaultLocation;

  // 1. CARGA INICIAL
  const loadInitialData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // A. Perfil
      const profile = await driverService.getDriverProfile();
      setDriverProfile(profile);

      // B. Vehículo
      const assignedVehicle = await vehicleService.getVehicleByDriver(profile.id);
      if (assignedVehicle) {
        setVehicle(assignedVehicle);
      } else {
        const allVehicles = await vehicleService.getAllVehicles();
        setAvailableVehicles(allVehicles.filter((v: any) => !v.driver_id));
      }

      // C. Rutas
      const allRoutes = await routeService.getAllRoutes();
      setRoutes(allRoutes);

      // D. Restaurar Viaje Activo
      const trip = await transportService.getActiveTripByDriver(profile.id);
      if (trip && trip.status !== "COMPLETED") {
        setActiveTrip(trip);
        setSelectedRouteId(trip.route_id);

        // Restaurar estado visual
        if (trip.status === "ACTIVE") setTripState("BOARDING");
        if (trip.status === "IN_PROGRESS") setTripState("IN_ROUTE");

        // Cargar mapa
        if (trip.route_id) {
          const poly = await transportService.getRoutePolyline(trip.route_id);
          if (poly) setRoutePolyline(poly);
        }
      } else {
        // Si no hay viaje, determinamos si puede configurar uno
        setTripState(assignedVehicle ? "CONFIG" : "IDLE");
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error cargando datos", description: "Verifica tu conexión." });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  // 2. ACCIONES DEL FLUJO
  const handleCreateTrip = async () => {
    if (!selectedRouteId || !vehicle || !driverProfile) {
      return toast({ variant: "destructive", title: "Faltan datos", description: "Selecciona una ruta primero." });
    }

    try {
      const tripData = {
        route_id: selectedRouteId,
        vehicle_id: vehicle.id,
        driver_id: driverProfile.id,
      };

      // Crear y Activar (Estado: Waiting for Passengers)
      const newTrip = await transportService.createTrip(tripData);
      const startedTrip = await transportService.startTrip(newTrip.id);

      // Cargar Polilínea
      const poly = await transportService.getRoutePolyline(selectedRouteId);
      if (poly) setRoutePolyline(poly);

      setActiveTrip(startedTrip);
      setTripState("BOARDING");

      toast({ 
        title: "Viaje Creado", 
        description: "El bus está visible. Esperando pasajeros...",
        className: "bg-blue-50 border-blue-200"
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleStartRoute = async () => {
    if (!activeTrip) return;

    try {
      // Iniciar Simulación GPS
      await simulationService.start({
        trip_id: activeTrip.id,
        route_id: selectedRouteId,
        driver_id: driverProfile!.id,
      });

      setTripState("IN_ROUTE");
      
      toast({ 
        title: "Ruta Iniciada", 
        description: "Telemetría transmitiendo en vivo.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error de simulación", description: error.message });
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeTrip) return;
    try {
      try { await simulationService.stop(activeTrip.id); } catch {} // Intentar detener simulación
      
      await transportService.completeTrip(activeTrip.id);

      // Reset total
      setActiveTrip(null);
      setSelectedRouteId("");
      setRoutePolyline("");
      setTripState("CONFIG");
      setPassengerCount(0);

      toast({ title: "Viaje Finalizado", description: "La unidad está libre nuevamente." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  // --- LOADER ---
  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Cargando sistema de control...</p>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="h-[calc(100vh-6rem)] p-4 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 bg-slate-100 dark:bg-slate-950 transition-colors animate-fade-in">
      
      {/* =======================================================
          COLUMNA IZQUIERDA: MAPA & HUD (Heads-Up Display)
      ======================================================= */}
      <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
        
        {/* COMPONENTE DE MAPA */}
        <div className="absolute inset-0 z-0">
            <LiveRouteMap
              routePolyline={routePolyline}
              busLocation={busLocation}
            />
        </div>

        {/* --- CAPA SUPERIOR (HUD) --- */}
        
        {/* 1. STATUS BADGE (Top Right) */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 items-end">
             <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                 isConnected 
                 ? "bg-green-500/90 text-white border-green-400 animate-pulse-slow" 
                 : "bg-slate-800/90 text-slate-400 border-slate-600"
             }`}>
                {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                {isConnected ? "SISTEMA ONLINE" : "OFFLINE"}
             </div>

             {activeTrip && (
                 <div className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    ID VIAJE: #{activeTrip.id}
                 </div>
             )}
        </div>

        {/* 2. DRIVER PROFILE (Top Left) */}
        {driverProfile && (
            <div className="absolute top-6 left-6 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 pr-6 rounded-full shadow-lg border border-white/50 dark:border-slate-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg border-2 border-white shadow-sm">
                    {driverProfile.name.charAt(0)}
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Operador</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{driverProfile.name}</p>
                </div>
            </div>
        )}

        {/* 3. TELEMETRÍA (Bottom Left - Solo en Ruta) */}
        {tripState === 'IN_ROUTE' && (
            <div className="absolute bottom-6 left-6 z-10 bg-slate-900/90 backdrop-blur-md text-white p-5 rounded-3xl shadow-2xl border border-slate-700/50 flex gap-6 min-w-[200px]">
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1"><Gauge size={12}/> Velocidad</p>
                    <p className="text-3xl font-black">{socketLocation?.speed?.toFixed(0) || 0} <span className="text-base font-normal text-slate-400">km/h</span></p>
                </div>
                <div className="w-px bg-slate-700"></div>
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1"><MapPin size={12}/> Rumbo</p>
                    <p className="text-3xl font-black">{socketLocation?.heading?.toFixed(0) || 0}<span className="text-base font-normal text-slate-400">°</span></p>
                </div>
            </div>
        )}

      </div>

      {/* =======================================================
          COLUMNA DERECHA: PANEL DE CONTROL
      ======================================================= */}
      <aside className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
        
        {/* HEADER DEL PANEL */}
        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Navigation className="text-blue-600" />
                Panel de Control
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Gestión de ruta y pasajeros</p>
        </div>

        {/* INFORMACIÓN DEL VEHÍCULO */}
        {vehicle ? (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 flex items-center justify-between border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-700 p-2.5 rounded-xl text-slate-600 dark:text-slate-300 shadow-sm">
                        <Bus size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Unidad Asignada</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white">{vehicle.plate}</p>
                    </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
        ) : (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium flex gap-2">
                <AlertTriangle size={18} /> No tienes vehículo asignado.
            </div>
        )}

        {/* CONTROLES DINÁMICOS (Lógica de Estados) */}
        <div className="flex-1 flex flex-col justify-center space-y-4">
            
            {/* ESTADO 1: CONFIGURACIÓN */}
            {tripState === 'CONFIG' && (
                <div className="space-y-4 animate-in slide-in-from-right">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Seleccionar Ruta</label>
                    <select
                        value={selectedRouteId}
                        onChange={(e) => setSelectedRouteId(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-700 dark:text-white border-transparent focus:border-blue-500 focus:ring-0 transition-all outline-none"
                    >
                        <option value="">-- Elige una ruta --</option>
                        {routes.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>

                    <Button
                        onClick={handleCreateTrip}
                        disabled={!selectedRouteId}
                        className="w-full h-16 rounded-2xl text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-blue-900/20 shadow-xl"
                    >
                        <Play className="mr-2 fill-current" /> PREPARAR UNIDAD
                    </Button>
                </div>
            )}

            {/* ESTADO 2: ABORDAJE (Waiting) */}
            {tripState === 'BOARDING' && (
                <div className="space-y-6 text-center animate-in zoom-in-95">
                    <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto text-yellow-600 animate-bounce-slow">
                        <Users size={40} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">Abordando Pasajeros</h3>
                        <p className="text-sm text-slate-500 mt-2">El viaje está activo pero detenido. Espera a que suban los estudiantes.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-400 uppercase">Estado Actual</p>
                        <p className="text-lg font-bold text-blue-600">En Parada / Espera</p>
                    </div>

                    <Button
                        onClick={handleStartRoute}
                        className="w-full h-20 rounded-2xl text-xl font-black bg-green-600 hover:bg-green-700 shadow-green-900/30 shadow-2xl hover:scale-[1.02] transition-transform"
                    >
                        <Navigation className="mr-3 w-8 h-8" /> INICIAR RUTA
                    </Button>
                </div>
            )}

            {/* ESTADO 3: EN RUTA */}
            {tripState === 'IN_ROUTE' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800/50 text-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                         <p className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-2">Transmisión Activa</p>
                         <h3 className="text-3xl font-black text-blue-800 dark:text-white">EN RUTA</h3>
                         <p className="text-xs text-blue-600/70 mt-1">Compartiendo ubicación real</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Pasajeros</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">--</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Próx. Parada</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Fac. Artes</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleCompleteTrip}
                        variant="destructive"
                        className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl mt-auto"
                    >
                        <Power className="mr-2" /> FINALIZAR VIAJE
                    </Button>
                </div>
            )}

            {/* ESTADO: IDLE (Sin vehículo) */}
            {tripState === 'IDLE' && (
                <div className="text-center p-6 opacity-50">
                    <Bus size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 font-medium">Contacta al administrador para asignación de unidad.</p>
                </div>
            )}

        </div>

      </aside>
    </div>
  );
};

export default DashboardPage;