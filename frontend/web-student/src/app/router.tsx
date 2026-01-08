import { Routes, Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '../features/auth/ProtectedRoute';

import AuthLayout from '../features/vehicle/layouts/AuthLayout';
import StudentLayout from '../features/vehicle/layouts/StudentLayout';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/student/DashboardPage';
import MyVehiclePage from '../pages/student/MyVehiclePage';

export function AppRouter() {
  return (
    <Routes>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/my-vehicle" element={<MyVehiclePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}
