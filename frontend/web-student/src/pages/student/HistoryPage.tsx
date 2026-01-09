import '@/styles/pages/HistoryPage.css';

interface Trip {
  id: string;
  date: string;
  route: string;
  driver: string;
  status: 'completed' | 'cancelled';
  duration?: string;
}

export default function HistoryPage() {
  // Mock data - En producción vendría de un hook
  const trips: Trip[] = [
    {
      id: '1',
      date: '2024-01-15',
      route: 'Ruta Norte',
      driver: 'Carlos Mendoza',
      status: 'completed',
      duration: '45 min'
    },
    {
      id: '2',
      date: '2024-01-14',
      route: 'Ruta Sur',
      driver: 'Pedro Gómez',
      status: 'completed',
      duration: '38 min'
    },
    {
      id: '3',
      date: '2024-01-13',
      route: 'Ruta Centro',
      driver: 'Jorge López',
      status: 'completed',
      duration: '52 min'
    },
    {
      id: '4',
      date: '2024-01-12',
      route: 'Ruta Norte',
      driver: 'Carlos Mendoza',
      status: 'cancelled'
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Historial de Viajes</h1>
        <p>Registro de tus viajes anteriores</p>
      </div>

      <div className="history-content">
        {trips.length === 0 ? (
          <div className="empty-state">
            <p>No hay viajes registrados</p>
          </div>
        ) : (
          <div className="trips-table-container">
            <table className="trips-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ruta</th>
                  <th>Conductor</th>
                  <th>Duración</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{formatDate(trip.date)}</td>
                    <td className="route-name">{trip.route}</td>
                    <td>{trip.driver}</td>
                    <td>{trip.duration || '-'}</td>
                    <td>
                      <span className={`status-badge ${trip.status}`}>
                        {trip.status === 'completed' ? 'Completado' : 'Cancelado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
