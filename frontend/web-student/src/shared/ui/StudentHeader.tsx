import { useAuth } from '@/features/auth/hooks/useAuth';
import '@/styles/components/StudentHeader.css';

interface StudentHeaderProps {
  fullName: string;
  email: string;
}

export default function StudentHeader({ fullName, email }: StudentHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="student-header">
      <div className="student-header-info">
        <h1 className="student-name">{fullName}</h1>
        <p className="student-email">{email}</p>
      </div>
      <button className="student-logout-btn" onClick={logout}>
        Cerrar Sesión
      </button>
    </header>
  );
}
