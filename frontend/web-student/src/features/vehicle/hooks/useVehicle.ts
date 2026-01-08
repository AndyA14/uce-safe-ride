import { useEffect, useState } from 'react';
import { getMyVehicles } from '../api';
import type { Vehicle } from '../types';

export function useVehicle() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyVehicles()
      .then((data) => {
        // Si la API devuelve un array, tomamos el primer vehículo
        // Si devuelve un objeto, lo usamos directamente
        const vehicleData = Array.isArray(data) ? data[0] || null : data;
        setVehicle(vehicleData);
      })
      .catch(() => setError('No se pudo cargar el vehículo'))
      .finally(() => setLoading(false));
  }, []);

  return { vehicle, loading, error };
}
