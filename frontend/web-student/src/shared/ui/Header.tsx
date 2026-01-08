import { useAuth } from '@/features/auth/hooks/useAuth';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}
    >
      <h1>Dashboard</h1>

      <button
        onClick={logout}
        style={{
          background: '#ef4444',
          border: 'none',
          padding: '0.5rem 1rem',
          color: 'white',
          borderRadius: 6,
          cursor: 'pointer'
        }}
      >
        Cerrar sesión
      </button>
    </header>
  );
}
