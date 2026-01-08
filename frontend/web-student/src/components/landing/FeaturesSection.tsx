import '@/styles/components/landing/FeaturesSection.css';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Seguimiento en Tiempo Real',
      description: 'Visualiza la ubicación exacta de tu bus universitario en el mapa con actualizaciones cada 5 segundos.',
      icon: '📍'
    },
    {
      title: 'Notificaciones Inteligentes',
      description: 'Recibe alertas cuando tu bus esté cerca de tu parada o si hay cambios en la ruta.',
      icon: '🔔'
    },
    {
      title: 'Tiempo de Llegada Estimado',
      description: 'Conoce exactamente cuánto tiempo tardará el bus en llegar a tu ubicación.',
      icon: '⏱️'
    },
    {
      title: 'Viajes Seguros',
      description: 'Sistema de verificación de conductores y monitoreo constante de cada viaje.',
      icon: '🛡️'
    },
    {
      title: 'Acceso Móvil',
      description: 'Diseño responsivo que funciona perfectamente en cualquier dispositivo.',
      icon: '📱'
    },
    {
      title: 'Gestión Centralizada',
      description: 'Panel administrativo completo para gestión de flotas, rutas y usuarios.',
      icon: '⚙️'
    }
  ];

  return (
    <section id="caracteristicas" className="features">
      <div className="features-container">
        <h2 className="features-title">Todo lo que necesitas</h2>
        <p className="features-subtitle">
          Una plataforma completa diseñada para hacer tu transporte universitario más eficiente y seguro.
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
