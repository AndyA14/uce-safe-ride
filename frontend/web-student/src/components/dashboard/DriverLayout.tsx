import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button'; 
import { Car, LogOut, User, Map, Settings } from 'lucide-react';

export function DriverLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col z-10">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">UCE Ride</h2>
              <p className="text-xs text-gray-500">Conductor</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/driver/profile')}>
            <User className="mr-2 h-4 w-4" /> Perfil
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/driver/routes')}>
            <Map className="mr-2 h-4 w-4" /> Rutas
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/driver/settings')}>
            <Settings className="mr-2 h-4 w-4" /> Configuración
          </Button>
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Salir
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}