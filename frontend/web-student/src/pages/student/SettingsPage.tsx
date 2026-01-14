import React, { useState } from 'react';
import { Settings, Bell, Moon, Sun, Shield, Smartphone, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState({
    busArrival: true,
    routeChanges: true,
    alerts: true,
    email: false,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('es');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="uce-card p-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary" strokeWidth={1.5} />
          Configuración
        </h1>
        <p className="text-muted-foreground mt-1">Personaliza tu experiencia en UCE Safe Ride</p>
      </div>

      {/* Notifications */}
      <div className="uce-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" strokeWidth={1.5} />
          Notificaciones
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Llegada del bus</Label>
              <p className="text-sm text-muted-foreground">Notificarte cuando tu bus esté cerca</p>
            </div>
            <Switch
              checked={notifications.busArrival}
              onCheckedChange={(checked) => setNotifications({ ...notifications, busArrival: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Cambios de ruta</Label>
              <p className="text-sm text-muted-foreground">Alertas sobre modificaciones en las rutas</p>
            </div>
            <Switch
              checked={notifications.routeChanges}
              onCheckedChange={(checked) => setNotifications({ ...notifications, routeChanges: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Alertas de seguridad</Label>
              <p className="text-sm text-muted-foreground">Información importante sobre el servicio</p>
            </div>
            <Switch
              checked={notifications.alerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, alerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Notificaciones por email</Label>
              <p className="text-sm text-muted-foreground">Recibir resumen diario por correo</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="uce-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          {darkMode ? <Moon className="w-5 h-5 text-primary" strokeWidth={1.5} /> : <Sun className="w-5 h-5 text-primary" strokeWidth={1.5} />}
          Apariencia
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Tema oscuro</Label>
              <p className="text-sm text-muted-foreground">Cambiar entre tema claro y oscuro</p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" /> Idioma
              </Label>
              <p className="text-sm text-muted-foreground">Selecciona tu idioma preferido</p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
            </Select>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="uce-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" strokeWidth={1.5} />
          Privacidad y Seguridad
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Compartir ubicación</Label>
              <p className="text-sm text-muted-foreground">Permitir que la app acceda a tu ubicación</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Sesiones activas
              </Label>
              <p className="text-sm text-muted-foreground">Gestionar dispositivos conectados</p>
            </div>
            <Button variant="outline" size="sm">
              Ver sesiones
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button className="w-full font-semibold" size="lg">
        Guardar Cambios
      </Button>
    </div>
  );
};

export default SettingsPage;
