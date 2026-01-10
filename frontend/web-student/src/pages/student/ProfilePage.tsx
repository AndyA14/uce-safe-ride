import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Loader2, Save, GraduationCap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getStudentProfile, updateStudentProfile } from '@/services/studentService';

const ProfilePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado con TODOS los campos que pediste
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: 'Quito, Ecuador', // Valor por defecto o vendría del back
    faculty: 'Facultad de Ingeniería',
    career: 'Ingeniería en Sistemas'
  });

  // CARGA DE DATOS
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getStudentProfile();
        
        // Actualizamos localStorage inmediatamente con lo que vino del servidor
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const refreshedUser = { ...currentUser, name: data.full_name, email: data.email };
        localStorage.setItem('user', JSON.stringify(refreshedUser));

        setProfile(prev => ({
          ...prev,
          full_name: data.full_name || '',
          email: data.email || '', 
          phone: data.phone || '',
          // Si el backend tuviera estos campos, los mapeas aquí:
          // address: data.address || prev.address,
        }));
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "No se pudo cargar la información.", variant: "destructive" });
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
      // 1. Guardar en Backend
      await updateStudentProfile({
        full_name: profile.full_name,
        phone: profile.phone
      });

      // 2. Persistir en localStorage (CRÍTICO PARA QUE NO SE BORRE AL CERRAR SESIÓN)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...currentUser, 
        name: profile.full_name, 
        // Si tuvieras login persistente real, esto ayuda a mantenerlo fresco
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast({ title: "¡Guardado!", description: "Perfil actualizado correctamente." });
      
      // Recarga suave para actualizar sidebar
      window.location.reload();

    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Header del Perfil */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-[#FFC107] flex items-center justify-center text-[#003da5] text-2xl font-bold shadow-lg">
          {profile.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h1>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
            {profile.career}
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
                value={profile.full_name} 
                onChange={e => setProfile({...profile, full_name: e.target.value})}
                className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto dark:text-white" 
              />
            </div>
          </div>

          {/* Email */}
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
                placeholder="+593..."
                className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto dark:text-white" 
              />
            </div>
          </div>

          {/* Dirección (Campo Visual Extra) */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Dirección</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-900 dark:border-slate-700">
              <MapPin className="w-4 h-4 text-gray-500" />
              <Input 
                value={profile.address} 
                disabled // Deshabilitado por ahora ya que no hay endpoint
                className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto dark:text-white" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving} className="bg-[#FFC107] text-[#003da5] hover:bg-[#ffcd38] font-bold">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Tarjeta 2: Información Académica (Visual) */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-[#003da5]" /> Información Académica
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Facultad</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-100 dark:bg-slate-800 dark:border-slate-700">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{profile.faculty}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Carrera</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-100 dark:bg-slate-800 dark:border-slate-700">
              <GraduationCap className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{profile.career}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;