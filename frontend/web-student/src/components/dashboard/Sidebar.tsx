import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bus, Map as MapIcon, History, User, Settings, LogOut,
  ChevronLeft, ChevronRight, Navigation, CreditCard,
  Bell, Bot, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import uceLogo from '@/assets/uce-logo.png';

type UserRole = 'STUDENT' | 'DRIVER' | 'ADMIN';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // --- MENÚ ESTUDIANTE ---
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT'] },
  { to: '/student/transport', label: 'Mi Transporte', icon: Bus, roles: ['STUDENT'] },
  { to: '/student/routes', label: 'Rutas', icon: MapIcon, roles: ['STUDENT'] },
  { to: '/student/profile', label: 'Mi Perfil', icon: User, roles: ['STUDENT'] },
  { to: '/student/settings', label: 'Configuración', icon: Settings, roles: ['STUDENT'] },
  
  // --- MENÚ CONDUCTOR ---
  { to: '/driver/dashboard', label: 'Panel Control', icon: LayoutDashboard, roles: ['DRIVER'] },
  { to: '/driver/profile', label: 'Licencia y Perfil', icon: User, roles: ['DRIVER'] },
  { to: '/driver/history', label: 'Bitácora de Viajes', icon: History, roles: ['DRIVER'] },
  { to: '/driver/settings', label: 'Sistema', icon: Settings, roles: ['DRIVER'] },
];

const SIDEBAR_EXPANDED_WIDTH = 'w-72';
const SIDEBAR_COLLAPSED_WIDTH = 'w-[90px]';

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const isDriver = user.role === 'DRIVER';

  // 🎨 TEMA: Ahora Conductor en Light Mode es AZUL UCE igual que Estudiante
  const theme = {
    bg: isDriver 
      ? 'bg-[#003da5] dark:bg-slate-900 border-r border-transparent dark:border-slate-800' // Azul en día, Gris en noche
      : 'bg-[#003da5] dark:bg-[#0c111f]',
    footerBg: isDriver 
      ? 'bg-[#003082] dark:bg-slate-950' // Azul oscuro en footer
      : 'bg-[#003082] dark:bg-[#0b0f1c]',
    activeItem: isDriver 
      ? 'bg-[#FFC107] text-[#003da5] dark:text-slate-900 shadow-lg' // Texto azul sobre amarillo
      : 'bg-[#FFC107] text-[#003da5]',
    hoverItem: isDriver 
      ? 'hover:bg-white/10 text-white/80 hover:text-white' // Hover estilo UCE
      : 'hover:bg-white/10 text-white/80 hover:text-white',
    borderColor: isDriver 
      ? 'border-white/10 dark:border-slate-800' 
      : 'border-white/10'
  };

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user.role as UserRole)
  );

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-50 flex flex-col',
          'transition-all duration-300 ease-in-out',
          collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
          theme.bg,
          'shadow-2xl text-white' // Forzamos texto blanco general
        )}
      >
        <button
          onClick={onToggleCollapse}
          className={cn(
            "absolute -right-3 top-20 rounded-full p-1.5 shadow-lg transition-transform hover:scale-110 border-2 z-50",
            // Botón amarillo siempre visible sobre azul
            "bg-[#FFC107] text-[#003da5] border-white/20"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={cn("flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden", theme.borderColor, "border-b")}>
          <div className="shrink-0 transition-transform duration-300 hover:scale-105 z-10 flex items-center justify-center w-full">
            <img 
              src={uceLogo} 
              alt="UCE" 
              className={cn(
                "object-contain transition-all duration-300",
                collapsed ? "w-14 h-14" : "w-16 h-16"
              )} 
            />
          </div>

          <div
            className={cn(
              'text-center transition-all duration-300 overflow-hidden whitespace-nowrap mt-3',
              collapsed ? 'w-0 opacity-0 h-0 scale-0' : 'w-auto opacity-100 h-auto scale-100'
            )}
          >
            <h2 className="font-bold text-lg tracking-wide leading-tight text-white">
              UCE Safe Ride
            </h2>
            <span className={cn(
              "text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mt-2 inline-block",
              isDriver 
                ? "bg-[#FFC107] text-[#003da5]" 
                : "bg-blue-800/50 text-blue-100 border border-blue-400/30"
            )}>
              {isDriver ? 'CONDUCTOR' : 'ESTUDIANTE'}
            </span>
          </div>
        </div>

        <nav className="flex flex-col flex-1 py-4 overflow-y-auto no-scrollbar w-full">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : ''}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-4 px-6 py-4 transition-all duration-200 font-medium tracking-wide text-[15px] group w-full',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? cn(theme.activeItem, "font-bold")
                    : theme.hoverItem
                )
              }
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", collapsed && "w-7 h-7")} />
              <span className={cn(
                'transition-all duration-300 truncate',
                collapsed ? 'hidden opacity-0 w-0' : 'block opacity-100 w-auto'
              )}>
                {item.label}
              </span>
              
              {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 text-xs font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl bg-slate-900 text-white">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={cn("p-4 border-t mt-auto", theme.footerBg, theme.borderColor)}>
          <div className={cn('flex items-center gap-3 mb-3', collapsed && 'justify-center')}>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm shrink-0 border-2",
              "bg-[#FFC107] text-[#003da5] border-white/20"
            )}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className={cn(
              'overflow-hidden transition-all duration-300',
              collapsed ? 'hidden opacity-0 w-0' : 'block opacity-100 w-full'
            )}>
              <p className="text-sm font-bold truncate text-white">{user.name}</p>
              <p className="text-[11px] truncate text-white/70">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium tracking-wide transition-colors border text-white/70 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;