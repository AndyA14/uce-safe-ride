import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-[#020817] overflow-hidden transition-colors duration-300">
      
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="p-6 md:p-8 max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;