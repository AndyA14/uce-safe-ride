import { useVehicles } from '@/features/vehicle/hooks/useVehicles';
import VehicleCard from '@/shared/ui/VehicleCard';
import '@/styles/pages/MyVehiclePage.css';

export default function MyVehiclePage() {
  const { vehicles, loading, error } = useVehicles();

  const handleViewLocation = (vehicleId: string) => {
    // TODO: Implementar navegación al mapa con la ubicación del vehículo
    console.log('Ver ubicación del vehículo:', vehicleId);
  };

  if (loading) {
    return (
      <div className="my-vehicle-page">
        <div className="page-header">
          <h1>Mi Transporte</h1>
        </div>
        <div className="loading-state">
          <p>Cargando transporte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-vehicle-page">
        <div className="page-header">
          <h1>Mi Transporte</h1>
        </div>
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="my-vehicle-page">
        <div className="page-header">
          <h1>Mi Transporte</h1>
        </div>
        <div className="empty-state">
          <p>No tienes transporte asignado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-vehicle-page">
      <div className="page-header">
        <h1>Mi Transporte</h1>
        <p className="page-subtitle">
          {vehicles.length} {vehicles.length === 1 ? 'vehículo asignado' : 'vehículos asignados'}
        </p>
      </div>

      <div className="vehicles-grid">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onViewLocation={() => handleViewLocation(vehicle.id)}
          />
        ))}
      </div>
    </div>
  );
}
