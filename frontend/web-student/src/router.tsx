import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

// Importar páginas
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/student/ProfilePage';
import HistoryPage from '@/pages/student/HistoryPage';
import SettingsPage from '@/pages/student/SettingsPage';
import DashboardPage from '@/pages/student/DashboardPage';
import RoutesPage from '@/pages/student/RoutesPage';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LoginModal from '@/components/landing/LoginModal';
import { DriverLayout } from '@/components/dashboard/DriverLayout';  
import ProfileDriverPage from '@/pages/driver/ProfilePage';

// Componente para manejar rutas privadas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {  
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para manejo de roles
interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
} 

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'DRIVER') return <Navigate to="/driver/profile" replace />;
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Redirección para usuarios autenticados
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (user) {
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'DRIVER') return <Navigate to="/driver/profile" replace />;
  }
  
  return <>{children}</>;
};

// ✅ Router corregido
export default function Router() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route 
        path="/" 
        element={
          <AuthRedirect>
            <Index />
          </AuthRedirect>
        } 
      />
      
      <Route 
        path="/login" 
        element={
          <AuthRedirect>
            <LoginModal />
          </AuthRedirect>
        } 
      />

      {/* Rutas ESTUDIANTE */}
      <Route 
        path="/student" 
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Rutas CONDUCTOR */}
      <Route 
        path="/driver" 
        element={
          <RoleRoute allowedRoles={['DRIVER']}>
            <DriverLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/driver/profile" replace />} />
        <Route path="profile" element={<ProfileDriverPage />} />
        <Route path="routes" element={<div className="p-8"><h1 className="text-2xl font-bold">Rutas del Conductor</h1></div>} />
        <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Configuración</h1></div>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );  
}