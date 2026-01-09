import { useEffect, useState } from 'react';
import { getMyVehicles } from '../api';
import type { Vehicle } from '../types';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyVehicles();
        setVehicles(data);
      } catch (err) {
        setError('No se pudieron cargar los vehículos');
        console.error('Error loading vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return { vehicles, loading, error };
}
