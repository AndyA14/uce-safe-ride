import { useState } from 'react';
import '@/styles/pages/SettingsPage.css';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Configuración</h1>
        <p>Personaliza tu experiencia</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Notificaciones</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <h3>Notificaciones Push</h3>
              <p>Recibe alertas cuando tu bus esté cerca</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Apariencia</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <h3>Modo Oscuro</h3>
              <p>Cambia el tema de la aplicación</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Información</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <h3>Versión de la Aplicación</h3>
              <p>1.0.0</p>
            </div>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <h3>Universidad Central del Ecuador</h3>
              <p>Sistema de Transporte Seguro Universitario</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
