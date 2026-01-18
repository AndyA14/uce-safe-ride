import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar'; 

export function DriverLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-300">
      
      {/* 1. Usamos el Componente Sidebar Compartido */}
      {/* Él solito detectará que eres DRIVER y se pondrá gris/amarillo */}
      <Sidebar 
        collapsed={collapsed} 
        onToggleCollapse={() => setCollapsed(!collapsed)} 
      />

      {/* 2. Contenido Principal (con margen dinámico) */}
      <main 
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Renderiza las páginas (Dashboard, Perfil, etc.) */}
        <Outlet />
      </main>

    </div>
  );
}