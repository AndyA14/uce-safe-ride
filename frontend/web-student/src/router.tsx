import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Asegúrate que esta ruta sea correcta
import { UserRole } from '@/types/user'; // Asegúrate de que la interfaz UserRole esté bien definida

// Importar las páginas
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/student/ProfilePage'; 
import HistoryPage from '@/pages/student/HistoryPage';
import SettingsPage from '@/pages/student/SettingsPage';
import DashboardPage from '@/pages/student/DashboardPage';
import RoutesPage from '@/pages/student/RoutesPage'; // Nueva página de Rutas
import DashboardLayout from '@/components/dashboard/DashboardLayout'; 
import LoginModal from '@/components/landing/LoginModal';
import { DriverLayout } from '@/components/dashboard/DriverLayout';
import ProfileDriverPage from '@/pages/driver/ProfilePage'; // Página de perfil de conductor

// Componente para manejar rutas privadas (estudiantes y conductores)
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

// Componente para manejar la validación de roles
interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'DRIVER') return <Navigate to="/driver/profile" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Componente para redirigir usuarios autenticados
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;

  if (user) {
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'DRIVER') return <Navigate to="/driver/profile" replace />;
  }

  return <>{children}</>;
};

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<AuthRedirect><Index /></AuthRedirect>} />
        <Route path="/login" element={<AuthRedirect><LoginModal isOpen={true} onClose={() => {}} /></AuthRedirect>} />

        {/* Rutas ESTUDIANTE */}
        <Route path="/student" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Rutas CONDUCTOR */}
        <Route path="/driver" element={
          <RoleRoute allowedRoles={['DRIVER']}>
            <DriverLayout />
          </RoleRoute>
        }>
          {/* Redirección inicial */}
          <Route index element={<Navigate to="/driver/profile" replace />} />
          <Route path="profile" element={<ProfileDriverPage />} />
          <Route path="routes" element={<div className="p-8">Rutas (WIP)</div>} />
          <Route path="settings" element={<div className="p-8">Configuración (WIP)</div>} />
        </Route>

        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
