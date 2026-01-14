import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, IdCard, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getDriverProfile } from '@/services/driverService';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    ci: '',
    license_number: '',
  });

  // CARGA DE DATOS
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getDriverProfile();
        console.log('🚗 Perfil cargado:', data);
        
        setProfile({
          name: data.name || '',
          email: data.email || '', 
          phone: data.phone || '',
          ci: data.ci || '',
          license_number: data.license_number || '',
        });

        // Actualizar localStorage con datos frescos
        if (authUser) {
          const updatedUser = { 
            ...authUser, 
            name: data.name,
            email: data.email,
            phone: data.phone,
            ci: data.ci,
            license_number: data.license_number,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

      } catch (error) {
        console.error('❌ Error cargando perfil:', error);
        toast({ 
          title: "Error", 
          description: "No se pudo cargar la información.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // GUARDAR DATOS
  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('💾 Guardando perfil:', profile);

      // Validación básica
      if (!profile.name.trim()) {
        toast({ 
          title: "Error", 
          description: "El nombre completo es obligatorio.", 
          variant: "destructive" 
        });
        setSaving(false);
        return;
      }

      // TODO: Implementar updateDriverProfile en driverService
      // await updateDriverProfile({
      //   name: profile.name.trim(),
      //   phone: profile.phone.trim(),
      // });

      // Actualizar localStorage
      if (authUser) {
        const updatedUser = { 
          ...authUser, 
          name: profile.name,
          phone: profile.phone,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast({ 
        title: "¡Guardado!", 
        description: "Perfil actualizado correctamente." 
      });

    } catch (error: any) {
      console.error('❌ Error guardando:', error);
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo guardar.", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Header del Perfil */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-[#FFC107] flex items-center justify-center text-[#003da5] text-2xl font-bold shadow-lg">
          {profile.name.charAt(0).toUpperCase() || 'C'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name || 'Conductor'}</h1>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
            Conductor Activo
          </span>
        </div>
      </div>
      
      {/* Tarjeta 1: Información Personal */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-[#003da5]" /> Información Personal
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Nombre */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Nombre Completo</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-900 dark:border-slate-700">
              <User className="w-4 h-4 text-gray-500" />
              <Input 
                value={profile.name} 
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto dark:text-white" 
                placeholder="Tu nombre completo"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Correo Electrónico</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-100 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</span>
            </div>
            <p className="text-[10px] text-gray-400">El correo no puede ser modificado</p>
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Teléfono</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-900 dark:border-slate-700">
              <Phone className="w-4 h-4 text-gray-500" />
              <Input 
                value={profile.phone} 
                onChange={e => setProfile({...profile, phone: e.target.value})} 
                placeholder="+593 999 999 999"
                className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto dark:text-white" 
              />
            </div>
          </div>

          {/* Cédula (Read-only) */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Cédula de Identidad</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-100 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed">
              <IdCard className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {profile.ci || 'No registrado'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Asignado por el sistema</p>
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Credenciales de Conductor */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-[#003da5]" /> Credenciales de Conductor
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Número de Licencia (Read-only) */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Número de Licencia</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-100 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {profile.license_number || 'No registrado'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Asignado por el sistema</p>
          </div>

          {/* ID de Conductor (Read-only) - del auth_user_id */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300">ID de Conductor</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-100 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed">
              <IdCard className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {authUser?.id || 'No disponible'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Identificador único</p>
          </div>
        </div>
      </div>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="bg-[#FFC107] text-[#003da5] hover:bg-[#ffcd38] font-bold px-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

    </div>
  );
};

export default ProfilePage;