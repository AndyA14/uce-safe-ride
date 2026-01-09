import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Bus, MapPin, History, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useStudentProfile } from '@/features/student/hooks/useStudentProfile';
import '@/styles/layouts/StudentLayout.css';

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout } = useAuth();
  const { profile, loading: profileLoading } = useStudentProfile();

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Mapa en Vivo', disabled: false },
    { to: '/vehicle', icon: Bus, label: 'Mi transporte', disabled: false },
    { to: '/routes', icon: MapPin, label: 'Rutas', disabled: true },
    { to: '/history', icon: History, label: 'Historial', disabled: false },
    { to: '/profile', icon: User, label: 'Perfil', disabled: false },
    { to: '/settings', icon: Settings, label: 'Configuración', disabled: false },
  ];

  return (
    <div className="student-layout">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`student-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <img 
              src="/uce-logo.png" 
              alt="UCE Logo" 
              className="sidebar-logo-img"
              onError={(e) => {
                // Si no existe el logo, ocultar la imagen
                e.currentTarget.style.display = 'none';
              }}
            />
            {!sidebarCollapsed && <h2 className="sidebar-logo">UCE Safe Ride</h2>}
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return item.disabled ? (
              <div
                key={item.to}
                className="sidebar-nav-item disabled"
                title="Próximamente"
              >
                <IconComponent className="nav-icon" size={20} />
                <span className="nav-label">{item.label}</span>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <IconComponent className="nav-icon" size={20} />
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {!profileLoading && profile && !sidebarCollapsed && (
            <div className="sidebar-user">
              <div className="user-avatar">
                {profile.full_name?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div className="user-info">
                <p className="user-name">{profile.full_name || 'Estudiante'}</p>
                <p className="user-email">{profile.email || ''}</p>
              </div>
            </div>
          )}
          {!profileLoading && profile && sidebarCollapsed && (
            <div className="sidebar-user-collapsed">
              <div className="user-avatar">
                {profile.full_name?.charAt(0).toUpperCase() || 'E'}
              </div>
            </div>
          )}
          <button 
            className="sidebar-logout" 
            onClick={logout}
            title={sidebarCollapsed ? 'Cerrar Sesión' : undefined}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>

        {/* Collapse Toggle Button */}
        <button
          className="sidebar-collapse-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Contenido Principal */}
      <div className={`student-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <main className="student-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
