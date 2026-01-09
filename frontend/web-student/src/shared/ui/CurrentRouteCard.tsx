import '@/styles/components/CurrentRouteCard.css';

interface CurrentRouteCardProps {
  routeName: string;
  busNumber: string;
  driverName: string;
  timeRemaining: string;
  location: string;
  progress: number;
}

export default function CurrentRouteCard({
  routeName,
  busNumber,
  driverName,
  timeRemaining,
  location,
  progress
}: CurrentRouteCardProps) {
  return (
    <div className="current-route-card">
      <div className="current-route-header">
        <h2>{routeName} - Bus {busNumber}</h2>
        <span className="route-status">En ruta</span>
      </div>
      
      <div className="current-route-body">
        <div className="route-info-row">
          <span className="route-label">Conductor:</span>
          <span className="route-value">{driverName}</span>
        </div>
        
        <div className="route-info-row">
          <span className="route-label">Tiempo estimado:</span>
          <span className="route-time">{timeRemaining}</span>
        </div>
        
        <div className="route-info-row">
          <span className="route-label">Ubicación:</span>
          <span className="route-value">{location}</span>
        </div>
        
        <div className="route-progress">
          <div className="progress-header">
            <span>Progreso del recorrido</span>
            <span className="progress-percentage">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
