import type { ReactNode } from 'react';
import '../styles/auth.css'; // Importamos los estilos aquí

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Aquí podrías poner el logo de UCE Safe Ride arriba del título */}
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        
        {children}
      </div>
    </div>
  );
};