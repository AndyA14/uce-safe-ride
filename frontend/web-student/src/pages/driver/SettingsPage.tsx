import React, { useState, useEffect } from 'react';
import { Settings, Truck, Moon, Sun, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
  };

  return (
    // 🎨 FONDO SLATE-200
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-8 md:p-12 animate-fade-in transition-colors duration-300">
      
      {/* 📏 CONTENEDOR ANGOSTO CENTRADO (max-w-4xl) */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <Settings className="w-8 h-8 text-slate-500" /> Configuración
          </h1>
        </div>

        {/* Tarjetas BLANCAS sobre fondo GRIS */}
        <Card className="border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-white">
              <Truck className="w-5 h-5 text-[#FFC107]" /> Preferencias de Viaje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-bold text-slate-900 dark:text-white">Auto-aceptar rutas</Label>
                <p className="text-sm text-slate-500">Asignar rutas automáticamente al iniciar turno.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Apariencia */}
        <Card className="border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
             <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-white">
                {darkMode ? <Moon className="w-5 h-5 text-[#FFC107]" /> : <Sun className="w-5 h-5 text-orange-500" />} Apariencia
             </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-bold text-slate-900 dark:text-white">Modo Oscuro</Label>
                <p className="text-sm text-slate-500">Cambiar interfaz a tema nocturno.</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
export default SettingsPage;