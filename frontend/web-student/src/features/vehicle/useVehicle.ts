import { useEffect, useState } from 'react';
import { getMyVehicle } from './api';
import type { Vehicle } from './types';

export function useVehicle() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyVehicle()
      .then(setVehicle)
      .catch(() => setError('No se pudo cargar el vehículo'))
      .finally(() => setLoading(false));
  }, []);

  return { vehicle, loading, error };
}
