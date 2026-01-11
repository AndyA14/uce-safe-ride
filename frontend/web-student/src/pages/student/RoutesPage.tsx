import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Servicios
import { getRoutes } from '@/services/routeService'; 
import { getCustomRoutes, createCustomRoute, deleteCustomRoute } from '@/services/studentService';
// Tipos
import { Route, CustomRoute } from '@/types/route';
// Componentes UI
import { MapPin, Navigation, Bus, Plus, Trash2, Home, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Usaremos Tabs para organizar
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

  // Estados
  const [publicRoutes, setPublicRoutes] = useState<Route[]>([]);
  const [customRoutes, setCustomRoutes] = useState<CustomRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); 

  // Formulario Nueva Ruta
  const [newRouteOpen, setNewRouteOpen] = useState(false);
  // Coordenadas iniciales (Quito, UCE aprox)
  const [formData, setFormData] = useState({
    name: '',
    originLat: -0.2105, 
    originLng: -78.4917,
    destLat: -0.1800,
    destLng: -78.4800
  });

  // Carga inicial
  useEffect(() => {
    loadAllRoutes();
  }, []);

  const loadAllRoutes = async () => {
    setLoading(true);
    try {
      const [pub, cust] = await Promise.all([
        getRoutes(),
        getCustomRoutes()
      ]);
      setPublicRoutes(pub);
      setCustomRoutes(cust);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) return;
    setIsCreating(true); 
    try {
      await createCustomRoute({
        name: formData.name,
        origin: { lat: Number(formData.originLat), lng: Number(formData.originLng) },
        destination: { lat: Number(formData.destLat), lng: Number(formData.destLng) }
      });
      
      toast({ title: "¡Ruta creada!", description: "Ahora los conductores podrán ver tu solicitud." });
      setNewRouteOpen(false);
      loadAllRoutes();
      // Reiniciar form
      setFormData({
        name: '',
        originLat: -0.2105, 
        originLng: -78.4917,
        destLat: -0.1800,
        destLng: -78.4800
      });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear la ruta.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta ruta?")) return;
    try {
      await deleteCustomRoute(id);
      toast({ title: "Eliminada", description: "La ruta ha sido borrada." });
      setCustomRoutes(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (loading && publicRoutes.length === 0 && customRoutes.length === 0) {
    return <div className="p-10 text-center">Cargando rutas...</div>;
  }

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      
      {/* HEADER + BOTÓN CREAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-8 h-8 text-[#003da5] dark:text-[#FFC107]" />
            Gestión de Rutas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Visualiza las rutas de la UCE o crea tu propio trayecto a casa.
          </p>
        </div>

        {/* MODAL PARA CREAR RUTA CON MAPA */}
        <Dialog open={newRouteOpen} onOpenChange={setNewRouteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003da5] hover:bg-[#002a7a] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Ruta Personal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Crear Ruta Personalizada</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nombre de la Ruta</Label>
                <Input 
                  placeholder="Ej: Casa - Valle de los Chillos" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* PESTAÑAS PARA SELECCIONAR ORIGEN Y DESTINO */}
              <Tabs defaultValue="origin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="origin">1. Punto de Origen</TabsTrigger>
                  <TabsTrigger value="dest">2. Punto de Destino</TabsTrigger>
                </TabsList>
                
                {/* MAPA DE ORIGEN */}
                <TabsContent value="origin" className="space-y-3 pt-4">
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4"/> Selecciona dónde te recogerá el bus</span>
                    <span className="font-mono text-xs">{formData.originLat.toFixed(4)}, {formData.originLng.toFixed(4)}</span>
                  </div>
                  <LocationPicker 
                    initialLat={formData.originLat}
                    initialLng={formData.originLng}
                    onLocationSelect={(lat, lng) => setFormData({...formData, originLat: lat, originLng: lng})}
                  />
                </TabsContent>

                {/* MAPA DE DESTINO */}
                <TabsContent value="dest" className="space-y-3 pt-4">
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-md text-sm text-green-800">
                    <span className="flex items-center gap-2"><Crosshair className="w-4 h-4"/> Selecciona tu destino final</span>
                    <span className="font-mono text-xs">{formData.destLat.toFixed(4)}, {formData.destLng.toFixed(4)}</span>
                  </div>
                  <LocationPicker 
                    initialLat={formData.destLat}
                    initialLng={formData.destLng}
                    onLocationSelect={(lat, lng) => setFormData({...formData, destLat: lat, destLng: lng})}
                  />
                </TabsContent>
              </Tabs>

            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!formData.name || isCreating} className="w-full sm:w-auto">
                {isCreating ? "Guardando..." : "Guardar Ruta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SECCIÓN 1: MIS RUTAS PERSONALIZADAS */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Home className="w-5 h-5" /> Mis Rutas
        </h2>
        
        {customRoutes.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No has creado rutas personalizadas aún.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customRoutes.map((route) => (
              <div key={route.id} className="bg-white dark:bg-[#0f172a] border border-blue-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative group hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[#003da5]">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 -mr-2"
                    onClick={() => handleDelete(route.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white truncate" title={route.name}>{route.name}</h3>
                <div className="text-xs text-gray-500 mt-2 space-y-1 bg-gray-50 dark:bg-slate-800 p-2 rounded-md">
                  <p className="flex items-center justify-between">
                    <span>Origen:</span> 
                    <span className="font-mono">{route.origin.lat.toFixed(3)}, {route.origin.lng.toFixed(3)}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Destino:</span> 
                    <span className="font-mono">{route.destination.lat.toFixed(3)}, {route.destination.lng.toFixed(3)}</span>
                  </p>
                </div>
                <Badge className="mt-3 bg-green-100 text-green-700 border-green-200">Activa</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: RUTAS OFICIALES (BUSES) */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Bus className="w-5 h-5" /> Rutas Oficiales UCE
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publicRoutes.map((route) => (
            <div key={route.id} className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-[#003da5]/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-xl">
                  <Bus className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <Badge variant={route.active ? "default" : "secondary"}>
                  {route.active ? "En Servicio" : "Inactiva"}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{route.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{route.direction || 'Ruta Circular'}</span>
              </div>
              <Button 
                onClick={() => navigate('/student/dashboard')}
                className="w-full mt-4 bg-gray-900 dark:bg-slate-700 hover:bg-gray-800 text-white"
              >
                Ver en Mapa
              </Button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default RoutesPage;