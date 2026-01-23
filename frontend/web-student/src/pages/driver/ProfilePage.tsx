import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, ShieldCheck, Bus, 
  MapPin, Award, LogOut, ChevronRight, Loader2,
  BarChart3, Users, Star, Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleService } from '@/services/vehicleService';
import { transportService } from '@/services/tripService';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalTrips: 0, totalPassengers: 0 });
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      try {
        const [history, v] = await Promise.all([
          transportService.getDriverHistory(user.id),
          vehicleService.getVehicleByDriver(user.id)
        ]);

        const passengers = history.reduce((acc: number, trip: any) => acc + (trip.current_passenger_count || 0), 0);

        setStats({
          totalTrips: history.length,
          totalPassengers: passengers
        });
        setVehicle(v);
      } catch (e) {
        console.error("Error al cargar datos del perfil", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-200 dark:bg-slate-950">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 p-6 md:p-10 transition-colors animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* CABECERA DE PERFIL */}
        <div className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border-l-8 border-l-blue-600 border-r-8 border-r-red-600">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden">
              <User size={64} className="text-blue-600" />
            </div>
            {/* Insignia de Dragón para el Conductor */}
            <div className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full shadow-lg">
              <Flame size={20} />
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {user?.name || "Vinicio"}
            </h1>
            <p className="text-blue-600 font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
              <Award size={18} /> Ingeniería en Sistemas de Información | UCE
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border">
                <Mail size={12} /> {user?.email}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border">
                <MapPin size={12} /> QUITO, ECUADOR
              </span>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl group hover:scale-105 transition-transform">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><BarChart3 /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Viajes en Bitácora</p>
                <p className="text-2xl font-black">{stats.totalTrips}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl group hover:scale-105 transition-transform">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600"><Users /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Uso del Servicio (UCE)</p>
                <p className="text-2xl font-black">{stats.totalPassengers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl group hover:scale-105 transition-transform">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl text-yellow-600"><Star /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reputación Académica</p>
                <p className="text-2xl font-black">5.0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* VEHÍCULO */}
          <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
                <Bus size={18} /> Unidad de Transporte Institucional
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {vehicle ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-blue-200">
                    <span className="text-xs font-bold text-slate-400">PLACA</span>
                    <span className="font-mono font-black text-blue-600 text-lg">{vehicle.plate}</span>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <span className="text-xs font-bold text-slate-400 uppercase">Modelo de Unidad</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{vehicle.model}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed rounded-2xl">
                  <Bus size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400 font-bold">VINCULA UN BUS EN EL PANEL DE CONTROL</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* DOCUMENTACIÓN */}
          <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-[2rem]">
            <CardHeader><CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-400"><ShieldCheck size={18} /> Verificación Profesional</CardTitle></CardHeader>
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100">
                <span className="text-xs font-bold text-green-700">Licencia de Conducir</span>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100">
                <span className="text-xs font-bold text-green-700">Credencial Universitaria (SIU)</span>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LOGOUT */}
        <div className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full h-16 rounded-2xl font-black text-lg bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/20"
            onClick={logout}
          >
            <LogOut size={20} className="mr-2" /> CERRAR SESIÓN SEGURA
          </Button>
          <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
            UCE Safe Ride © 2026 | Thesis Project | Quito, Ecuador
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
