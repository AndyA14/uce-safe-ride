import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Car, Shield, Loader2, Save, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '0991234567',
    license_number: '1725033669',
    license_type: 'Tipo E (Profesional)'
  });

  useEffect(() => {
    if (authUser) {
      setProfile(prev => ({
        ...prev,
        name: authUser.name || '',
        email: authUser.email || '',
      }));
    }
  }, [authUser]);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: "¡Guardado!", description: "Perfil actualizado correctamente." });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-4 md:p-8 animate-fade-in transition-colors duration-300">
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-[#FFC107] flex items-center justify-center text-slate-900 text-3xl font-bold shadow-lg border-4 border-white dark:border-slate-800">
            {profile.name.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name || 'Conductor'}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-[#FFC107] text-slate-900 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                Conductor Activo
              </span>
              <span className="text-slate-500 text-xs font-mono">ID: {authUser?.id?.slice(0, 8) || '...'}</span>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* TARJETA 1: DATOS PERSONALES */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-lg transition-colors">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-slate-800 pb-2">
              <User className="w-5 h-5 text-slate-400" /> Información Personal
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-400">Nombre Completo</Label>
                {/* 🎨 CORRECCIÓN DE COLORES DE INPUT */}
                <div className="flex items-center gap-3 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-slate-950 focus-within:ring-2 ring-[#FFC107] transition-all">
                  <User className="w-4 h-4 text-slate-400" />
                  <Input 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    className="border-0 bg-transparent p-0 focus-visible:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-400">Correo Electrónico</Label>
                <div className="flex items-center gap-3 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 bg-gray-100 dark:bg-slate-900/50 cursor-not-allowed">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">{profile.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-400">Teléfono</Label>
                <div className="flex items-center gap-3 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-slate-950 focus-within:ring-2 ring-[#FFC107] transition-all">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <Input 
                    value={profile.phone} 
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    className="border-0 bg-transparent p-0 focus-visible:ring-0 text-slate-900 dark:text-white" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA 2: CREDENCIALES */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-lg transition-colors">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-slate-800 pb-2">
              <Shield className="w-5 h-5 text-[#FFC107]" /> Licencia y Permisos
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-400">Número de Licencia</Label>
                <div className="flex items-center gap-3 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-slate-950">
                  <IdCard className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-mono font-medium text-slate-700 dark:text-white">{profile.license_number}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-400">Tipo de Licencia</Label>
                <div className="flex items-center gap-3 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-slate-950">
                  <Car className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-white">{profile.license_type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-[#FFC107] text-slate-900 hover:bg-yellow-400 font-bold px-8 py-6 shadow-lg shadow-yellow-900/20 text-md rounded-xl transition-transform active:scale-95"
          >
            {saving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-5 h-5 mr-2" /> Guardar Cambios</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;