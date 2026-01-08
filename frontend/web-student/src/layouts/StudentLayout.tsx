import { NavLink, Outlet } from 'react-router-dom';

export default function StudentLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: 'white' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#0f172a', padding: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          UCE Safe Ride
        </h2>

        <nav style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* OJO: Cambié to="/" por to="/dashboard" para que coincida con tu router */}
          <NavLink 
            to="/dashboard" 
            style={({ isActive }) => ({ 
              color: isActive ? '#3b82f6' : 'white', 
              textDecoration: 'none',
              fontWeight: isActive ? 'bold' : 'normal'
            })}
          >
            🏠 Dashboard
          </NavLink>

          <NavLink 
            to="/vehicle" 
            style={({ isActive }) => ({ 
              color: isActive ? '#3b82f6' : 'white', 
              textDecoration: 'none',
              fontWeight: isActive ? 'bold' : 'normal'
            })}
          >
            🚌 Mi transporte
          </NavLink>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}