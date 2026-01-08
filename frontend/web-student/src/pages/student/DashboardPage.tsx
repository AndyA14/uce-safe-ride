import Header from '@/shared/ui/Header';
import { useAuth } from '@features/auth/hooks/useAuth';

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div>
      <p>Bienvenido a UCE Safe Ride</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
