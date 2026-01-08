import { useVehicle } from '@/features/vehicle/hooks/useVehicle';

export default function MyVehiclePage() {
  const { vehicle, loading, error } = useVehicle();

  if (loading) return <p>Cargando transporte...</p>;
  if (error) return <p>{error}</p>;
  if (!vehicle) return <p>No tienes transporte asignado</p>;

  return (
    <div>
      <h2>Mi Transporte</h2>

      <ul>
        <li><strong>Placa:</strong> {vehicle.plate}</li>
        <li><strong>Estado:</strong> {vehicle.status}</li>
      </ul>

      <button style={{ marginTop: 16 }}>
        Ver ubicación
      </button>
    </div>
  );
}
