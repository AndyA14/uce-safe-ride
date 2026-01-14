import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios
import { transportService } from '@/services/transportService';
import { getCustomRoutes, createCustomRoute, deleteCustomRoute } from '@/services/studentService';

// Tipos
import { CustomRoute } from '@/types/route';
import { Vehicle } from '@/types/transport';

// UI
import {
  MapPin,
  Navigation,
  Bus,
  Plus,
  Trash2,
  Home,
  Crosshair,
  Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

import { useToast } from '@/hooks/use-toast';
import LocationPicker from '@/components/common/LocationPicker';

const RoutesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // =========================
  // STATE
  // =========================
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customRoutes, setCustomRoutes] = useState<CustomRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newRouteOpen, setNewRouteOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    originLat: -0.2105,
    originLng: -78.4917,
    destLat: -0.18,
    destLng: -78.48,
  });

  // =========================
  // DATA LOAD
  // =========================
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [vehiclesData, customRoutesData] = await Promise.all([
        transportService.getAllVehicles(),
        getCustomRoutes(),
      ]);

      // 🛡️ DEFENSA TOTAL
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setCustomRoutes(Array.isArray(customRoutesData) ? customRoutesData : []);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las rutas.',
        variant: 'destructive',
      });
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // JOIN VEHICLE
  // =========================
  const handleJoin = async (vehicleId: string) => {
    try {
      await transportService.joinVehicle(vehicleId);

      toast({
        title: '¡Bienvenido a bordo! 🚌',
        description: 'Te has asignado correctamente a esta unidad.',
      });

      navigate('/student/transport');
    } catch (error: any) {
      toast({
        title: 'No pudimos asignarte',
        description:
          error?.response?.data?.detail || 'El bus podría estar lleno.',
        variant: 'destructive',
      });
    }
  };

  // =========================
  // CREATE CUSTOM ROUTE
  // =========================
  const handleCreateCustom = async () => {
    if (!formData.name) return;

    setIsCreating(true);
    try {
      await createCustomRoute({
        name: formData.name,
        origin: {
          lat: Number(formData.originLat),
          lng: Number(formData.originLng),
        },
        destination: {
          lat: Number(formData.destLat),
          lng: Number(formData.destLng),
        },
      });

      toast({ title: '¡Ruta creada!', description: 'Ruta guardada con éxito.' });

      setNewRouteOpen(false);
      loadAllData();

      setFormData({
        name: '',
        originLat: -0.2105,
        originLng: -78.4917,
        destLat: -0.18,
        destLng: -78.48,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo crear la ruta.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // =========================
  // DELETE CUSTOM ROUTE
  // =========================
  const handleDeleteCustom = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta ruta?')) return;

    try {
      await deleteCustomRoute(id);
      setCustomRoutes(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Ruta eliminada' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center animate-pulse">
        Cargando sistema de rutas...
      </div>
    );
  }

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  return (
    <div className="space-y-10 p-6 pb-10 animate-fade-in">
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="w-7 h-7 text-blue-700" />
            Gestión de Transporte
          </h1>
          <p className="text-gray-500">
            Únete a un bus oficial o gestiona rutas personales.
          </p>
        </div>

        <Dialog open={newRouteOpen} onOpenChange={setNewRouteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Ruta Personal
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Ruta Personalizada</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <Tabs defaultValue="origin">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="origin">Origen</TabsTrigger>
                  <TabsTrigger value="dest">Destino</TabsTrigger>
                </TabsList>

                <TabsContent value="origin">
                  <LocationPicker
                    initialLat={formData.originLat}
                    initialLng={formData.originLng}
                    onLocationSelect={(lat, lng) =>
                      setFormData({
                        ...formData,
                        originLat: lat,
                        originLng: lng,
                      })
                    }
                  />
                </TabsContent>

                <TabsContent value="dest">
                  <LocationPicker
                    initialLat={formData.destLat}
                    initialLng={formData.destLng}
                    onLocationSelect={(lat, lng) =>
                      setFormData({
                        ...formData,
                        destLat: lat,
                        destLng: lng,
                      })
                    }
                  />
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button
                onClick={handleCreateCustom}
                disabled={!formData.name || isCreating}
              >
                {isCreating ? 'Guardando...' : 'Guardar Ruta'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* =========================
          BUSES
      ========================= */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Bus className="w-5 h-5" />
          Unidades Disponibles
        </h2>

        {safeVehicles.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
            No se encontraron rutas disponibles o hubo un error al cargar.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeVehicles.map(bus => (
              <div
                key={bus.id}
                className="bg-white border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex justify-between mb-4">
                  <Bus />
                  <Badge>{bus.status}</Badge>
                </div>

                <h3 className="font-bold">{bus.plate}</h3>
                <p className="text-sm text-gray-500">{bus.model}</p>

                <div className="flex items-center gap-2 text-sm mt-4">
                  <Users size={16} />
                  {bus.capacity} asientos
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={() => handleJoin(bus.id)}
                >
                  Unirme a esta Ruta
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================
          CUSTOM ROUTES
      ========================= */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Home className="w-5 h-5" />
          Mis Rutas Guardadas
        </h2>

        {customRoutes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
            No has creado rutas personalizadas aún.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoutes.map(route => (
              <div key={route.id} className="border rounded-xl p-4 relative">
                <h3 className="font-bold truncate">{route.name}</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={() => handleDeleteCustom(route.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RoutesPage;
