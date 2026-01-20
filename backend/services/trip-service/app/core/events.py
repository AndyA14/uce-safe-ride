from enum import Enum

class EventType(str, Enum):
    """
    Tipos de eventos del sistema (Kafka Topics / Event Keys)
    """
    # Eventos de Ciclo de Vida del Viaje
    TRIP_CREATED = "trip.created"
    TRIP_STARTED = "trip.started"
    TRIP_COMPLETED = "trip.completed"
    TRIP_CANCELLED = "trip.cancelled"
    TRIP_LOCATION_UPDATED = "trip.location_updated"
    
    # Eventos de Pasajeros
    PASSENGER_JOINED = "passenger.joined"
    PASSENGER_BOARDED = "passenger.boarded"
    PASSENGER_REMOVED = "passenger.removed"
    PASSENGER_DROPPED_OFF = "passenger.dropped_off"
    