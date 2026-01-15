import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bus,
  Map as MapIcon,
  History,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Navigation,
  CreditCard,
  Bell,
  Bot,
  LayoutDashboard
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
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT'] },
  { to: '/student/tracking', label: 'Tracking', icon: Navigation, roles: ['STUDENT'] },
  { to: '/student/transport', label: 'Mi Transporte', icon: Bus, roles: ['STUDENT'] },
  { to: '/student/routes', label: 'Rutas', icon: MapIcon, roles: ['STUDENT'] },
  { to: '/student/history', label: 'Historial', icon: History, roles: ['STUDENT'] },
  { to: '/student/payments', label: 'Pagos', icon: CreditCard, roles: ['STUDENT'] },
  { to: '/student/notifications', label: 'Notificaciones', icon: Bell, roles: ['STUDENT'] },
  { to: '/student/assistant', label: 'Asistente', icon: Bot, roles: ['STUDENT'] },
  { to: '/student/profile', label: 'Perfil', icon: User, roles: ['STUDENT'] },
  { to: '/student/settings', label: 'Configuración', icon: Settings, roles: ['STUDENT'] },
  { to: '/driver/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['DRIVER'] },
  { to: '/driver/profile', label: 'Perfil', icon: User, roles: ['DRIVER'] },
  { to: '/driver/history', label: 'Historial', icon: History, roles: ['DRIVER'] },
  { to: '/driver/settings', label: 'Configuración', icon: Settings, roles: ['DRIVER'] },
];

const SIDEBAR_EXPANDED_WIDTH = 'w-56';
const SIDEBAR_COLLAPSED_WIDTH = 'w-24';

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user.role as UserRole)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-50 flex flex-col',
        'transition-[width] duration-300',
        collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
        'bg-[#003da5] text-white',
        'dark:bg-[#0c111f] dark:text-white'
      )}
    >
      {/* TOGGLE */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-24 bg-[#FFC107] text-[#003da5] rounded-full p-1 shadow-md hover:scale-110 transition-transform border border-white/20"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* HEADER */}
      <div className="p-6 flex flex-col items-center border-b border-white/10 dark:border-white/20 min-h-[120px] overflow-hidden">
        <div className="shrink-0">
          <img src={uceLogo} alt="UCE" className="w-12 h-12 object-contain" />
        </div>

        <div
          className={cn(
            'text-center transition-all duration-300 overflow-hidden whitespace-nowrap mt-3',
            collapsed ? 'w-0 opacity-0 h-0' : 'w-auto opacity-100 h-auto'
          )}
        >
          <h2 className="font-bold text-lg tracking-wide">UCE Safe Ride</h2>
          <span className="text-[10px] font-medium tracking-wide uppercase">{user.role}</span>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex flex-col flex-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : ''}
            className={({ isActive }) =>
              cn(
                'flex-1 flex items-center gap-3 px-4 transition-colors duration-200 font-medium tracking-wide text-[15px]',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-[#FFC107] text-[#003da5] font-bold'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span
              className={cn(
                'transition-all duration-300',
                collapsed ? 'hidden opacity-0' : 'block opacity-100'
              )}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10 dark:border-white/20 bg-[#003082] dark:bg-[#0b0f1c]">
        <div className={cn('flex items-center gap-3 mb-4 px-2', collapsed && 'justify-center')}>
          <div className="w-10 h-10 rounded-full bg-[#FFC107] flex items-center justify-center text-[#003da5] font-bold">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              collapsed ? 'hidden opacity-0' : 'block opacity-100'
            )}
          >
            <p className="text-sm font-bold tracking-wide truncate max-w-[140px]">{user.name}</p>
            <p className="text-[11px] text-white/70 truncate max-w-[140px] tracking-wide">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium tracking-wide
                     text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Cerrar Sesión'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
