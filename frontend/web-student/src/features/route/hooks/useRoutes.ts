import { useEffect, useState } from 'react';
import { getRoutes } from '../api';
import type { Route } from '../types';

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRoutes();
        setRoutes(data.filter(route => route.active));
      } catch (err) {
        setError('No se pudieron cargar las rutas');
        console.error('Error loading routes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return { routes, loading, error };
}
