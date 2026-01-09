import '@/styles/components/VehicleCard.css';
import type { Vehicle } from '@/features/vehicle/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onViewLocation?: () => void;
}

export default function VehicleCard({ vehicle, onViewLocation }: VehicleCardProps) {
  const occupancyPercentage = vehicle.capacity && vehicle.current_occupancy
    ? Math.round((vehicle.current_occupancy / vehicle.capacity) * 100)
    : 0;

  const isActive = vehicle.status === 'ACTIVE';

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-header">
        <div className="vehicle-card-title">
          <h3>{vehicle.plate}</h3>
          <span className={`vehicle-status ${vehicle.status.toLowerCase()}`}>
            {vehicle.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="vehicle-card-body">
        {vehicle.route_name && (
          <div className="vehicle-info-row">
            <span className="vehicle-label">Ruta:</span>
            <span className="vehicle-value">{vehicle.route_name}</span>
          </div>
        )}

        {vehicle.driver_name && (
          <div className="vehicle-info-row">
            <span className="vehicle-label">Conductor:</span>
            <span className="vehicle-value">{vehicle.driver_name}</span>
          </div>
        )}

        {vehicle.capacity && (
          <div className="vehicle-info-row">
            <span className="vehicle-label">Capacidad:</span>
            <div className="vehicle-capacity">
              <span className="vehicle-value">
                {vehicle.current_occupancy || 0} / {vehicle.capacity}
              </span>
              <div className="capacity-bar">
                <div 
                  className="capacity-fill" 
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {isActive && onViewLocation && (
        <div className="vehicle-card-footer">
          <button 
            className="vehicle-btn-primary"
            onClick={onViewLocation}
          >
            Ver Ubicación
          </button>
        </div>
      )}
    </div>
  );
}
