import React, { useEffect, useState } from 'react';
import { Star, ShieldCheck, Phone, Bus, User } from 'lucide-react';
import { transportService } from '@/services/transportService';
import { driverService, DriverProfile } from '@/services/driverService';
import { Vehicle } from '@/types/transport'; 

/* =========================
   INFO CARD COMPONENT
========================= */
interface InfoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  statusColor?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, subtitle, statusColor = "text-blue-600" }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    {subtitle && <p className={`text-sm font-medium mt-1 ${statusColor}`}>{subtitle}</p>}
  </div>
);

/* =========================
   UTILS
========================= */
const getVehicleStatus = (status: string) => {
  if (['ACTIVE', 'AVAILABLE', 'IN_ROUTE'].includes(status)) {
    return { label: 'Operativo', color: 'text-green-600' };
  }
  return { label: 'Fuera de Servicio', color: 'text-orange-600' };
};

/* =========================
   TRANSPORT PAGE
========================= */
const TransportPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<DriverProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Obtener perfil del estudiante
        const profile = await transportService.getMyProfile();
        if (profile && profile.id) {
          // 2️⃣ Obtener transporte asignado
          const assignedVehicle = await transportService.getMyTransport(profile.id);
          setVehicle(assignedVehicle);

          // 3️⃣ Si hay conductor asignado, obtener su info
          if (assignedVehicle?.driver_id) {
            const driverInfo = await driverService.getDriverById(assignedVehicle.driver_id);
            setDriver(driverInfo);
          }
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse">Cargando transporte...</div>;

  if (!vehicle) {
    return (
      <div className="p-10 text-center animate-fade-in">
        <div className="inline-block p-6 bg-yellow-50 rounded-full mb-4">
          <Bus className="w-8 h-8 text-yellow-600"/>
        </div>
        <h2 className="text-xl font-bold">Sin transporte asignado</h2>
        <p className="text-gray-500">No tienes una unidad escolar asignada.</p>
      </div>
    );
  }

  const vehicleStatus = getVehicleStatus(vehicle.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Transporte Asignado</h1>

      {/* Tarjeta del Conductor */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${vehicle.is_active ? 'bg-green-500' : 'bg-red-500'}`} />

        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-400">
              {driver?.name?.charAt(0) || <User size={40}/>}
            </span>
          </div>
          <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-4 border-white dark:border-slate-900">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="text-center md:text-left flex-1 space-y-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {driver ? driver.name : "Conductor no asignado"}
            </h2>
            <p className="text-blue-600 font-medium text-lg">Conductor Oficial UCE</p>
          </div>

          <div className="flex justify-center md:justify-start gap-4 text-sm mt-4">
            {driver?.phone && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg">
                <Phone size={16} /> {driver.phone}
              </div>
            )}
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info del Vehículo */}
      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard 
          title="Vehículo" 
          value={vehicle.plate} 
          subtitle={vehicle.model || vehicle.vehicle_type} 
        />
        <InfoCard 
          title="Capacidad / Estado" 
          value={`${vehicle.capacity} Pasajeros`} 
          subtitle={vehicleStatus.label} 
          statusColor={vehicleStatus.color}
        />
      </div>
    </div>
  );
};

export default TransportPage;
