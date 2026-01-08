import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "@/pages/public/LandingPage";
import DashboardPage from "@/pages/student/DashboardPage";
import MyVehiclePage from "@/pages/student/MyVehiclePage";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import StudentLayout from "@/layouts/StudentLayout";  

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected student routes (Privadas) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vehicle" element={<MyVehiclePage />} />
        </Route>
      </Route>

      {/* Ruta 404: Cualquier otra cosa va a la landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
