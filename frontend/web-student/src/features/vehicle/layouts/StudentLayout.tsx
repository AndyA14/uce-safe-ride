import { Outlet } from 'react-router-dom';

export default function StudentLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: 'white' }}>
      <aside style={{
        width: 240,
        background: '#0f172a',
        padding: '1rem'
      }}>
        <h2>UCE Safe Ride</h2>
        <nav style={{ marginTop: 24 }}>
          <p>🏠 Dashboard</p>
          <p>🚌 Mi transporte</p>
          <p>📍 Tracking</p>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
