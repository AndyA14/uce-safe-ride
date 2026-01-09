import '@/styles/components/ActivityCard.css';

interface Activity {
  id: string;
  type: 'trip_completed' | 'bus_notified' | 'route_changed';
  route_name: string;
  message: string;
  time_ago: string;
}

interface ActivityCardProps {
  activities: Activity[];
  title: string;
}

export default function ActivityCard({ activities, title }: ActivityCardProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trip_completed':
        return '✓';
      case 'bus_notified':
        return '🔔';
      case 'route_changed':
        return '🔄';
      default:
        return '•';
    }
  };

  return (
    <div className="activity-card">
      <h3 className="activity-title">{title}</h3>
      <div className="activity-list">
        {activities.length === 0 ? (
          <p className="activity-empty">No hay actividad reciente</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <span className="activity-icon">{getActivityIcon(activity.type)}</span>
              <div className="activity-content">
                <span className="activity-message">{activity.message}</span>
                <span className="activity-time">{activity.time_ago}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
