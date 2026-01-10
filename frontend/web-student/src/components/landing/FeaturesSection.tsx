import React from 'react';
import { MapPin, Bell, Clock, Shield, Smartphone, Users } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Seguimiento en Tiempo Real',
    description: 'Visualiza la ubicación exacta de tu bus universitario en el mapa con actualizaciones cada 5 segundos.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: Bell,
    title: 'Notificaciones Inteligentes',
    description: 'Recibe alertas cuando tu bus esté cerca de tu parada o si hay cambios en la ruta.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: Clock,
    title: 'Tiempo de Llegada Estimado',
    description: 'Conoce exactamente cuánto tiempo tardará el bus en llegar a tu ubicación.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Shield,
    title: 'Viajes Seguros',
    description: 'Sistema de verificación de conductores y monitoreo constante de cada viaje.',
    color: 'bg-warning/10 text-warning',
  },
  {
    icon: Smartphone,
    title: 'Acceso Móvil',
    description: 'Diseño responsivo que funciona perfectamente en cualquier dispositivo.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: Users,
    title: 'Gestión Centralizada',
    description: 'Panel administrativo completo para gestión de flotas, rutas y usuarios.',
    color: 'bg-success/10 text-success',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Características
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una plataforma completa diseñada para hacer tu transporte universitario más eficiente y seguro.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-glass transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
