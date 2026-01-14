import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; 
import Sidebar from './Sidebar'; // Ajusta la ruta si es necesario

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      {/* CORREGIDO: Solo pasamos collapsed y la función toggle */}
      <Sidebar 
        collapsed={collapsed} 
        onToggleCollapse={() => setCollapsed(!collapsed)} 
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 p-8 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Outlet renderiza la página actual (Dashboard, Tracking, etc.) */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;