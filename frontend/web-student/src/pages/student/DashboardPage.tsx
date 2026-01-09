import { useRoutes } from '@/features/route/hooks/useRoutes';
import { useVehicles } from '@/features/vehicle/hooks/useVehicles';
import CurrentRouteCard from '@/shared/ui/CurrentRouteCard';
import RouteListCard from '@/shared/ui/RouteListCard';
import ActivityCard from '@/shared/ui/ActivityCard';
import '@/styles/pages/DashboardPage.css';

export default function DashboardPage() {
  const { routes, loading: routesLoading } = useRoutes();
  const { vehicles } = useVehicles();

  // Mock data para la ruta actual (en producción vendría de tracking service)
  const currentRoute = vehicles.length > 0 ? {
    routeName: vehicles[0].route_name || 'Ruta Norte',
    busNumber: vehicles[0].plate || '12',
    driverName: vehicles[0].driver_name || 'Carlos Mendoza',
    timeRemaining: '5 min',
    location: 'Av. América',
    progress: 75
  } : null;

  // Mock data para actividad reciente
  const recentActivities = [
    {
      id: '1',
      type: 'trip_completed' as const,
      route_name: 'Ruta Norte',
      message: 'Viaje completado',
      time_ago: 'Hace 2 horas'
    },
    {
      id: '2',
      type: 'bus_notified' as const,
      route_name: 'Parada Ingeniería',
      message: 'Bus notificado',
      time_ago: 'Hace 3 horas'
    },
    {
      id: '3',
      type: 'trip_completed' as const,
      route_name: 'Ruta Sur',
      message: 'Viaje completado',
      time_ago: 'Ayer'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        {/* Main Map Area - Full width on desktop, with floating cards */}
        <div className="dashboard-main-area">
          {/* Floating Current Route Card */}
          {currentRoute && (
            <div className="dashboard-route-card-floating">
              <CurrentRouteCard
                routeName={currentRoute.routeName}
                busNumber={currentRoute.busNumber}
                driverName={currentRoute.driverName}
                timeRemaining={currentRoute.timeRemaining}
                location={currentRoute.location}
                progress={currentRoute.progress}
              />
            </div>
          )}

          {/* Map Placeholder / Empty State */}
          <div className="dashboard-map-area">
            {!currentRoute && (
              <div className="empty-route-state-glass">
                <p>No hay ruta activa en este momento</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info - Desktop */}
        <div className="dashboard-sidebar">
          {!routesLoading && routes.length > 0 && (
            <RouteListCard 
              routes={routes} 
              title="Rutas Disponibles" 
            />
          )}
          <ActivityCard 
            activities={recentActivities} 
            title="Actividad Reciente" 
          />
        </div>
      </div>
    </div>
  );
}
