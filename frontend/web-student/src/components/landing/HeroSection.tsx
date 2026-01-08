import '@/styles/components/landing/HeroSection.css';

interface HeroSectionProps {
  onGetStartedClick: () => void;
}

export default function HeroSection({ onGetStartedClick }: HeroSectionProps) {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span>Sistema de Transporte Seguro Universitario</span>
          </div>
          <h1 className="hero-title">
            Tu viaje seguro empieza aquí
          </h1>
          <p className="hero-description">
            Conectamos a estudiantes con transporte universitario en tiempo real. 
            Seguimiento GPS, rutas optimizadas y viajes seguros garantizados.
          </p>
          <div className="hero-actions">
            <button onClick={onGetStartedClick} className="hero-btn-primary">
              Comenzar Ahora →
            </button>
            <a href="#rutas" className="hero-btn-secondary">
              Ver Rutas Disponibles
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
