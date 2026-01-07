import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.tsx';
import { ProtectedRoute } from '../libs/auth-lib/ProtectedRoute';
import RegisterPage from '../pages/RegisterPage.tsx';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />


      <Route
        path="/"
        element={
          <ProtectedRoute>
            <h1>Dashboard Student</h1>
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
};
