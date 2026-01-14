/**
 * Driver Settings Page
 * Manage notifications and app preferences
 */

import React from 'react';
import { Settings, Bell, Moon, Globe, Shield, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SettingsPage: React.FC = () => {
  const notificationSettings = [
    { id: 'trip_reminders', label: 'Recordatorios de viajes', description: 'Notificaciones antes de cada viaje', enabled: true },
    { id: 'passenger_updates', label: 'Actualizaciones de pasajeros', description: 'Avisos sobre solicitudes de parada', enabled: true },
    { id: 'system_updates', label: 'Actualizaciones del sistema', description: 'Noticias y cambios importantes', enabled: false },
  ];

  const appSettings = [
    { id: 'dark_mode', label: 'Modo oscuro', description: 'Tema oscuro para la aplicación', icon: Moon, enabled: false },
    { id: 'language', label: 'Idioma', description: 'Español (Ecuador)', icon: Globe, value: 'es-EC' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Configuración
        </h1>
        <p className="text-muted-foreground">Personaliza tu experiencia en la aplicación</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationSettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <p className="font-medium">{setting.label}</p>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={setting.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferencias de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appSettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <setting.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{setting.label}</p>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
              </div>
              {setting.id === 'dark_mode' ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={setting.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              ) : (
                <Button variant="outline" size="sm">
                  Cambiar
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Seguridad y Privacidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Cambiar contraseña
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Ver política de privacidad
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Términos y condiciones
          </Button>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Ayuda y Soporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Centro de ayuda
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Contactar soporte
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Reportar un problema
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          <p>UCE Safe Ride - Versión Conductor 1.0.0</p>
          <p className="mt-1">© 2024 Universidad Central del Ecuador</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;