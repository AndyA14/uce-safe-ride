import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

// =====================
// Páginas públicas
// =====================
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import LoginModal from '@/components/landing/LoginModal';

// =====================
// Student pages
// =====================
import StudentDashboardPage from '@/pages/student/DashboardPage';
import StudentTrackingPage from '@/pages/student/TrackingPage';
import StudentRoutesPage from '@/pages/student/RoutesPage';
import StudentHistoryPage from '@/pages/student/HistoryPage';
import StudentPaymentsPage from '@/pages/student/PaymentsPage';
import StudentNotificationsPage from '@/pages/student/NotificationsPage';
import StudentAssistantPage from '@/pages/student/AssistantPage';
import StudentProfilePage from '@/pages/student/ProfilePage';
import StudentSettingsPage from '@/pages/student/SettingsPage';
import StudentTransportPage from '@/pages/student/TransportPage';
// =====================
// Driver pages
// =====================
import DriverDashboardPage from '@/pages/driver/DashboardPage';
import DriverProfilePage from '@/pages/driver/ProfilePage';
import DriverHistoryPage from '@/pages/driver/HistoryPage';
import DriverSettingsPage from '@/pages/driver/SettingsPage';

// =====================
// Layouts
// =====================
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { DriverLayout } from '@/components/dashboard/DriverLayout';

// ======================================================
// PrivateRoute: usuario autenticado
// ======================================================
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// ======================================================
// RoleRoute: validación por rol
// ======================================================
interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'DRIVER') return <Navigate to="/driver/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ======================================================
// AuthRedirect: redirige si ya está logueado
// ======================================================
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (user) {
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'DRIVER') return <Navigate to="/driver/dashboard" replace />;
  }

  return <>{children}</>;
};

// ======================================================
// Router principal
// ======================================================
export default function Router() {
  return (
    <Routes>
      {/* ===================== */}
      {/* Rutas públicas */}
      {/* ===================== */}
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

      {/* ===================== */}
      {/* Rutas ESTUDIANTE */}
      {/* ===================== */}
      <Route
        path="/student"
        element={
          <RoleRoute allowedRoles={['STUDENT']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="tracking" element={<StudentTrackingPage />} />
        <Route path="transport" element={<StudentTransportPage />} />
        <Route path="routes" element={<StudentRoutesPage />} />
        <Route path="history" element={<StudentHistoryPage />} />
        <Route path="payments" element={<StudentPaymentsPage />} />
        <Route path="notifications" element={<StudentNotificationsPage />} />
        <Route path="assistant" element={<StudentAssistantPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="settings" element={<StudentSettingsPage />} />
      </Route>

      {/* ===================== */}
      {/* Rutas CONDUCTOR */}
      {/* ===================== */}
      <Route
        path="/driver"
        element={
          <RoleRoute allowedRoles={['DRIVER']}>
            <DriverLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="dashboard" element={<DriverDashboardPage />} />
        <Route path="history" element={<DriverHistoryPage />} />
        <Route path="profile" element={<DriverProfilePage />} />
        <Route path="settings" element={<DriverSettingsPage />} />
      </Route>

      {/* ===================== */}
      {/* 404 */}
      {/* ===================== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
