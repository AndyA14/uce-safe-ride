import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Servicios
import { getRoutes } from '@/services/routeService'; 
import { getCustomRoutes, createCustomRoute, deleteCustomRoute } from '@/services/studentService';
// Tipos
import { Route, CustomRoute } from '@/types/route';
// UI Components
import { MapPin, Navigation, Bus, Plus, Trash2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const RoutesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados
  const [publicRoutes, setPublicRoutes] = useState<Route[]>([]);
  const [customRoutes, setCustomRoutes] = useState<CustomRoute[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- CORRECCIÓN AQUÍ: Quitamos el espacio en el nombre de la variable ---
  const [isCreating, setIsCreating] = useState(false); 

  // Formulario Nueva Ruta
  const [newRouteOpen, setNewRouteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    originLat: -0.2105, // Default UCE
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

  // Manejar creación
  const handleCreate = async () => {
    if (!formData.name) return;
    
    // Usamos la variable corregida
    setIsCreating(true); 
    
    try {
      await createCustomRoute({
        name: formData.name,
        origin: { lat: Number(formData.originLat), lng: Number(formData.originLng) },
        destination: { lat: Number(formData.destLat), lng: Number(formData.destLng) }
      });
      
      toast({ title: "¡Ruta creada!", description: "Ahora los conductores podrán ver tu solicitud." });
      setNewRouteOpen(false);
      loadAllRoutes(); // Recargar lista
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear la ruta.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  // Manejar eliminación
  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta ruta?")) return;
    try {
      await deleteCustomRoute(id);
      toast({ title: "Eliminada", description: "La ruta ha sido borrada." });
      // Actualización optimista de la UI
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

        {/* MODAL PARA CREAR RUTA */}
        <Dialog open={newRouteOpen} onOpenChange={setNewRouteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003da5] hover:bg-[#002a7a] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Ruta Personal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Ruta Personalizada</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre de la Ruta</Label>
                <Input 
                  placeholder="Ej: Casa - Valle de los Chillos" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitud Origen</Label>
                  <Input type="number" value={formData.originLat} onChange={e => setFormData({...formData, originLat: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Longitud Origen</Label>
                  <Input type="number" value={formData.originLng} onChange={e => setFormData({...formData, originLng: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitud Destino</Label>
                  <Input type="number" value={formData.destLat} onChange={e => setFormData({...formData, destLat: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Longitud Destino</Label>
                  <Input type="number" value={formData.destLng} onChange={e => setFormData({...formData, destLng: Number(e.target.value)})} />
                </div>
              </div>
              <p className="text-xs text-gray-400">* En el futuro podrás seleccionar esto en el mapa.</p>
            </div>
            <DialogFooter>
              {/* CORRECCIÓN AQUÍ: Usamos la variable correcta en el ternario */}
              <Button onClick={handleCreate} disabled={!formData.name || isCreating}>
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
              <div key={route.id} className="bg-white dark:bg-[#0f172a] border border-blue-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative group">
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
                <h3 className="font-bold text-gray-900 dark:text-white">{route.name}</h3>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>Origen: {route.origin.lat.toFixed(4)}, {route.origin.lng.toFixed(4)}</p>
                  <p>Destino: {route.destination.lat.toFixed(4)}, {route.destination.lng.toFixed(4)}</p>
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