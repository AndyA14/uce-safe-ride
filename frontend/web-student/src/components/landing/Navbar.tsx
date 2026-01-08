import '@/styles/components/landing/Navbar.css';

interface NavbarProps {
  onLoginClick: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>UCE Safe Ride</h2>
          <span className="navbar-subtitle">Universidad Central del Ecuador</span>
        </div>
        
        <div className="navbar-links">
          <a href="#caracteristicas">Características</a>
          <a href="#rutas">Rutas</a>
          <a href="#contacto">Contacto</a>
          <button onClick={onLoginClick} className="navbar-login-btn">
            Iniciar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
