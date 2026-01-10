import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Importamos las páginas
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import HistoryPage from '@/pages/student/HistoryPage';
import ProfilePage from '@/pages/student/ProfilePage';
import SettingsPage from '@/pages/student/SettingsPage';
import DashboardPage from '@/pages/student/DashboardPage';
// 1. IMPORTAR LA NUEVA PÁGINA DE RUTAS
import RoutesPage from '@/pages/student/RoutesPage'; 

import DashboardLayout from '@/components/dashboard/DashboardLayout'; 

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/student",
    element: (
      <PrivateRoute>
        <DashboardLayout /> 
      </PrivateRoute>
    ),
    children: [
      {
        path: "", 
        element: <Navigate to="/student/dashboard" replace />, 
      },
      {
        path: "dashboard", 
        element: <DashboardPage />, 
      },
      // 2. AGREGAR LA RUTA AQUÍ
      {
        path: "routes", 
        element: <RoutesPage />, 
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}