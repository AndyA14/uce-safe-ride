import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Servicios (Solo Estudiantes)
import { getCustomRoutes, createCustomRoute, deleteCustomRoute } from '@/services/studentService';
// Tipos
import { CustomRoute } from '@/types/route';
// UI
import {
  Navigation,
  Plus,
  Trash2,
  Home,
  MapPin,
  Crosshair
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const { toast } = useToast();

  // =========================
  // STATE
  // =========================
  const [customRoutes, setCustomRoutes] = useState<CustomRoute[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Form State
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
      const customRoutesData = await getCustomRoutes();
      // 🛡️ DEFENSA TOTAL
      setCustomRoutes(Array.isArray(customRoutesData) ? customRoutesData : []);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus rutas.',
        variant: 'destructive',
      });
      setCustomRoutes([]);
    } finally {
      setLoading(false);
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
      
      // Reset Form
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
      <div className="p-10 text-center animate-pulse dark:text-gray-300">
        Cargando tus rutas...
      </div>
    );
  }

  return (
    <div className="space-y-10 p-6 pb-10 animate-fade-in">
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Navigation className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            Gestión de Rutas
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestiona tus trayectos personales frecuentes.
          </p>
        </div>

        <Dialog open={newRouteOpen} onOpenChange={setNewRouteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#001E42] dark:bg-blue-600 hover:bg-[#003366] text-white">
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
                placeholder="Ej: Casa - Universidad"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />

              <Tabs defaultValue="origin">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="origin">Origen</TabsTrigger>
                  <TabsTrigger value="dest">Destino</TabsTrigger>
                </TabsList>

                <TabsContent value="origin">
                  <div className="mb-2 p-2 bg-blue-50 text-blue-700 text-sm rounded flex items-center gap-2">
                     <MapPin size={16}/> Selecciona dónde tomas el transporte
                  </div>
                  <LocationPicker
                    initialLat={formData.originLat}
                    initialLng={formData.originLng}
                    onLocationSelect={(lat, lng) =>
                      setFormData({ ...formData, originLat: lat, originLng: lng })
                    }
                  />
                </TabsContent>

                <TabsContent value="dest">
                  <div className="mb-2 p-2 bg-green-50 text-green-700 text-sm rounded flex items-center gap-2">
                     <Crosshair size={16}/> Selecciona tu destino
                  </div>
                  <LocationPicker
                    initialLat={formData.destLat}
                    initialLng={formData.destLng}
                    onLocationSelect={(lat, lng) =>
                      setFormData({ ...formData, destLat: lat, destLng: lng })
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
          CUSTOM ROUTES LIST
      ========================= */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
          <Home className="w-5 h-5" />
          Mis Rutas Guardadas
        </h2>

        {customRoutes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
            No has creado rutas personalizadas aún.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoutes.map(route => (
              <div 
                key={route.id} 
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-4 relative shadow-sm hover:shadow-md transition-all"
              >
                <div className="pr-8">
                    <h3 className="font-bold truncate text-gray-900 dark:text-white">{route.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Personalizada</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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