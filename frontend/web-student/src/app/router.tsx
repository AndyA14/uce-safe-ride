import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <h1>Dashboard Student (¡Bienvenido!)</h1>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};