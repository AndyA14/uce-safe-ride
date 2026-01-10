import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; 
import { getStudentProfile } from '@/services/studentService'; // <--- USAMOS EL SERVICIO CORRECTO
import {
  User,
  History,
  Bus,
  LogOut,
  Settings,
  Map,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import uceLogo from '@/assets/uce-logo.png';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { logout, user } = useAuth(); // Datos básicos de la sesión (Auth)
  const [collapsed, setCollapsed] = useState(false);

  // 1. ESTADO INICIAL INTELIGENTE
  // Intentamos leer del localStorage primero para mostrar datos AL INSTANTE.
  // Si no hay nada, usamos los datos básicos del contexto Auth.
  const [displayUser, setDisplayUser] = useState(() => {
    const saved = localStorage.getItem('user');
    const local = saved ? JSON.parse(saved) : {};
    return {
      name: local.name || user?.name || "Estudiante",
      email: local.email || user?.email || "cargando..."
    };
  });

  // Calculamos la inicial
  const userInitial = displayUser.name ? displayUser.name.charAt(0).toUpperCase() : "U";

  // 2. EFECTO DE SINCRONIZACIÓN (Backend 8002)
  useEffect(() => {
    const syncData = async () => {
      try {
        // Pedimos los datos frescos al microservicio de Estudiantes
        const freshData = await getStudentProfile();
        
        // Si hay datos, actualizamos el estado y el localStorage
        if (freshData) {
          const newData = {
            name: freshData.full_name,
            email: freshData.email,
            // Mantenemos otros datos viejos si los hubiera
            ...JSON.parse(localStorage.getItem('user') || '{}'),
          };

          // Guardamos para la próxima vez
          localStorage.setItem('user', JSON.stringify(newData));
          
          // Actualizamos la vista
          setDisplayUser({
            name: freshData.full_name,
            email: freshData.email
          });
        }
      } catch (error) {
        console.error("No se pudo sincronizar perfil:", error);
        // No hacemos nada visual, dejamos los datos del localStorage que ya se muestran
      }
    };

    syncData();
  }, []);

  const menuItems = [
    { icon: Bus, label: 'Mi Transporte', path: '/student/dashboard' },
    { icon: Map, label: 'Rutas', path: '/student/routes' },
    { icon: History, label: 'Historial', path: '/student/history' },
    { icon: User, label: 'Perfil', path: '/student/profile' },
    { icon: Settings, label: 'Configuración', path: '/student/settings' },
  ];

  return (
    <div
      className={cn(
        "h-screen bg-[#003da5] dark:bg-[#020817] text-white flex flex-col shadow-xl transition-all duration-300 z-50 shrink-0 border-r border-white/10 dark:border-slate-800 relative",
        // Ajustamos el ancho colapsado para que quepa el logo cómodamente
        collapsed ? "w-[90px]" : "w-64"
      )}
    >
      {/* Botón Flotante para Colapsar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 bg-[#FFC107] text-[#003da5] rounded-full p-1 shadow-md hover:scale-110 transition-transform z-50 border border-white/20"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* --- HEADER --- */}
      <div className="p-6 flex flex-col items-center border-b border-white/10 dark:border-slate-800 overflow-hidden min-h-[120px]">
        {/* LOGO FIJO: 'shrink-0' evita que se haga pequeño */}
        <div className="bg-white p-2 rounded-full mb-3 shadow-lg shrink-0 transition-all">
          <img
            src={uceLogo}
            alt="UCE"
            className="w-12 h-12 object-contain"
          />
        </div>

        {/* Texto que se oculta al colapsar */}
        <div className={cn(
          "text-center transition-all duration-300 overflow-hidden whitespace-nowrap",
          collapsed ? "w-0 opacity-0 h-0" : "w-auto opacity-100 h-auto"
        )}>
          <h2 className="font-bold text-lg tracking-wide">UCE Safe Ride</h2>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full mt-1 font-medium inline-block">Estudiante</span>
        </div>
      </div>

      {/* --- NAVEGACIÓN --- */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : ""}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                isActive
                  ? "bg-[#FFC107] text-[#003da5] shadow-md font-bold"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-0"
              )
            }
          >
            <item.icon className="w-6 h-6 shrink-0" />
            <span className={cn(
              "whitespace-nowrap transition-all duration-300",
              collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
            )}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* --- FOOTER (Datos del Estudiante) --- */}
      <div className="p-4 border-t border-white/10 dark:border-slate-800 bg-[#003082] dark:bg-[#0f172a]">
        
        {/* Info Usuario */}
        <div className={cn("flex items-center gap-3 mb-4 px-2", collapsed && "justify-center")}>
          {/* Inicial / Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#FFC107] flex items-center justify-center text-[#003da5] font-bold shadow-sm shrink-0">
            {userInitial}
          </div>

          {/* Texto (Nombre y Correo) */}
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
          )}>
            <p className="text-sm font-bold truncate max-w-[140px]" title={displayUser.name}>
              {displayUser.name}
            </p>
            <p className="text-[10px] text-white/70 truncate max-w-[140px]" title={displayUser.email}>
              {displayUser.email}
            </p>
          </div>
        </div>

        {/* Botón Cerrar Sesión */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-white/70 hover:text-white hover:bg-white/10 py-2 rounded-lg transition-colors text-xs font-medium"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Cerrar Sesión"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;