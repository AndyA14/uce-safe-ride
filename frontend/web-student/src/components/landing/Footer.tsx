import '@/styles/components/landing/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>UCE Safe Ride</h3>
            <p>Sistema de transporte inteligente universitario.</p>
            <p>Conectando estudiantes con su destino de forma segura y eficiente.</p>
          </div>
          
          <div className="footer-section">
            <h4>Enlaces Rápidos</h4>
            <ul>
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#caracteristicas">Características</a></li>
              <li><a href="#rutas">Rutas</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>
          
          <div className="footer-section" id="contacto">
            <h4>Contacto</h4>
            <p>soporte@uce.edu.ec</p>
            <p>+593 2 252 6810</p>
            <p>Av. América, Quito, Ecuador</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2024 UCE Safe Ride. Universidad Central del Ecuador. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
