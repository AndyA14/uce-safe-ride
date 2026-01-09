import '@/styles/components/RouteListCard.css';
import type { Route } from '@/features/route/types';

interface RouteListCardProps {
  routes: Route[];
  title: string;
}

export default function RouteListCard({ routes, title }: RouteListCardProps) {
  return (
    <div className="route-list-card">
      <h3 className="route-list-title">{title}</h3>
      <div className="route-list">
        {routes.length === 0 ? (
          <p className="route-list-empty">No hay rutas disponibles</p>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="route-item">
              <span className="route-item-name">{route.name}</span>
              <span className="route-item-badge">
                {Math.floor(Math.random() * 5) + 1} buses activos
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
