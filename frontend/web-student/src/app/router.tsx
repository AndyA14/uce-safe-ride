import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/student/DashboardPage";
import MyVehiclePage from "@/pages/student/MyVehiclePage";
import ProtectedRoute  from "@/features/auth/ProtectedRoute";
import StudentLayout from "@/layouts/StudentLayout";  
import AuthLayout from "@/layouts/AuthLayout";        


export const AppRouter = () => {
  return (
   
    <Routes>

      {/* Auth routes (Públicas) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected student routes (Privadas) */}
      <Route element={<ProtectedRoute />}>
        {/* Aquí anidamos el Layout del estudiante */}
        <Route element={<StudentLayout />}>
          {/* Redirección: Si entra a "/", lo mandamos al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vehicle" element={<MyVehiclePage />} />
        </Route>
      </Route>

      {/* Ruta 404: Cualquier otra cosa va al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
};