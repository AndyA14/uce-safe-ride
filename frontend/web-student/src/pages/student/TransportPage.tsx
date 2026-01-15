import React, { useEffect, useState } from 'react';
import { Bus, Phone, ShieldCheck, User, Users, AlertCircle, XCircle } from 'lucide-react';
import { transportService } from '@/services/transportService';
import { getDriverById, DriverProfile } from '@/services/driverService';
import { Vehicle } from '@/types/transport';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog";

/* =========================
   INFO CARD COMPONENT
========================= */
const InfoCard = ({ title, value, subtitle, statusColor = "text-blue-600" }: any) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex-1">
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{title}</p>
    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    {subtitle && <p className={`text-xs font-medium mt-1 ${statusColor}`}>{subtitle}</p>}
  </div>
);

const TransportPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // ✅ CAMBIO: Ahora manejamos un ARRAY de mis vehículos
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>([]);
  const [driversInfo, setDriversInfo] = useState<Record<string, DriverProfile>>({});
  
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. OBTENER MIS VEHÍCULOS
      const myTransportData = await transportService.getMyVehicle();
      
      // Asegurar que sea un array
      const myRides = Array.isArray(myTransportData) 
        ? myTransportData 
        : (myTransportData ? [myTransportData] : []);

      setMyVehicles(myRides);

      // 2. CARGAR CONDUCTORES (Para cada vehículo asignado)
      if (myRides.length > 0) {
        const driversMap: Record<string, DriverProfile> = {};
        await Promise.all(myRides.map(async (v) => {
          if (v.driver_id) {
            try {
              const driver = await getDriverById(v.driver_id);
              driversMap[v.id] = driver;
            } catch (e) { console.warn(`No driver for ${v.id}`); }
          }
        }));
        setDriversInfo(driversMap);
      } else {
        // 3. SI NO TENGO NADA, CARGAR DISPONIBLES
        const allVehicles = await transportService.getAllVehicles();
        setAvailableVehicles(Array.isArray(allVehicles) ? allVehicles : []);
      }

    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Error cargando datos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (vehicleId: string) => {
    try {
      await transportService.joinVehicle(vehicleId);
      toast({ title: "¡Te has unido!", description: "Viaje registrado correctamente." });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: "No pudimos asignarte.", variant: "destructive" });
    }
  };

  // ✅ NUEVA FUNCIÓN: Cancelar transporte
  const handleLeave = async (vehicleId: string) => {
    try {
      await transportService.leaveVehicle(vehicleId);
      toast({ title: "Viaje Cancelado", description: "Te has bajado de la unidad." });
      // Actualizar la UI localmente para que sea rápido
      setMyVehicles(prev => prev.filter(v => v.id !== vehicleId));
      if (myVehicles.length <= 1) {
        loadData(); 
      }
    } catch (error) {
      toast({ title: "Error", description: "No pudimos cancelar el viaje.", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse dark:text-gray-300">Cargando transporte...</div>;
  }

  // ==========================================
  // ESCENARIO 1: TENGO AL MENOS UN TRANSPORTE (Lista de Mis Viajes)
  // ==========================================
  if (myVehicles.length > 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in p-4 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bus className="text-blue-600 dark:text-blue-400" /> 
          Mis Transportes Activos ({myVehicles.length})
        </h1>

        <div className="space-y-6">
          {myVehicles.map((vehicle) => {
            const driver = driversInfo[vehicle.id];
            
            return (
              <div key={vehicle.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-all hover:shadow-lg">
                {/* Barra de estado superior */}
                <div className={`absolute top-0 left-0 w-full h-2 ${vehicle.status === 'AVAILABLE' || vehicle.status === 'IN_ROUTE' ? 'bg-green-500' : 'bg-orange-500'}`} />
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Columna Izquierda: Conductor */}
                  <div className="flex flex-col items-center md:items-start min-w-[200px] border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 pb-6 md:pb-0 md:pr-8">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center">
                        {driver?.name ? (
                          <span className="text-3xl font-bold text-gray-400">{driver.name.charAt(0).toUpperCase()}</span>
                        ) : (
                          <User size={32} className="text-gray-400" />
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full border-2 border-white dark:border-slate-900">
                        <ShieldCheck className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="text-center md:text-left">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {driver?.name || "Sin Asignar"}
                      </h2>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">Conductor Oficial</p>
                      {driver?.phone && (
                        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs">
                          <Phone size={12} /> {driver.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna Derecha: Detalles del Bus */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <InfoCard 
                        title="Unidad / Placa" 
                        value={vehicle.plate} 
                        subtitle={vehicle.model} 
                      />
                      <InfoCard 
                        title="Estado / Capacidad" 
                        value={vehicle.status} 
                        subtitle={`${vehicle.capacity} pax`}
                        statusColor="text-green-600 dark:text-green-400" 
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-slate-800">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-900">
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar / Bajarme
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Deseas cancelar este viaje?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Te eliminarás de la lista de pasajeros de la unidad {vehicle.plate}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Volver</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleLeave(vehicle.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Sí, bajarme
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // ESCENARIO 2: NO TENGO TRANSPORTE (Lista de Disponibles)
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-4 pb-20">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
        <div>
          <h3 className="font-bold text-yellow-800 dark:text-yellow-500">Sin Transporte Asignado</h3>
          <p className="text-yellow-700 dark:text-yellow-600 text-sm">
            Selecciona una unidad de la lista para registrar tu viaje.
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Unidades Disponibles
      </h2>

      {availableVehicles.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
          <p className="text-gray-500 dark:text-gray-400">No hay buses activos en este momento.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableVehicles.map((bus) => (
            <div 
              key={bus.id} 
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <Bus className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700">
                  {bus.status}
                </Badge>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {bus.plate}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {bus.model || "Transporte Institucional"}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <Users size={16} /> <span>{bus.capacity} Asientos</span>
                </div>
              </div>

              <Button 
                onClick={() => handleJoin(bus.id)}
                className="w-full bg-[#001E42] dark:bg-blue-600 hover:bg-[#003366] dark:hover:bg-blue-700 text-white rounded-xl h-12"
              >
                Subirme a este Bus
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransportPage;