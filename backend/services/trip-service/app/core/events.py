from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Tipos de eventos publicados por el Trip Service"""
    
    # Trip events
    TRIP_CREATED = "trip.created"
    TRIP_STARTED = "trip.started"
    TRIP_COMPLETED = "trip.completed"
    TRIP_CANCELLED = "trip.cancelled"
    TRIP_LOCATION_UPDATED = "trip.location_updated"
    
    # Passenger events
    PASSENGER_JOINED = "passenger.joined"
    PASSENGER_BOARDED = "passenger.boarded"
    PASSENGER_REMOVED = "passenger.removed"


class EventPriority(str, Enum):
    """Prioridad de procesamiento del evento"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class BaseEvent(BaseModel):
    """Estructura base de un evento"""
    event_type: EventType
    timestamp: datetime = Field(default_factory=datetime.now)
    priority: EventPriority = EventPriority.NORMAL
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# Event factories para crear eventos específicos
def create_trip_event(
    event_type: EventType,
    trip_id: int,
    route_id: int,
    driver_id: int,
    vehicle_id: int,
    **kwargs
) -> BaseEvent:
    """Factory para crear eventos de Trip"""
    data = {
        "trip_id": trip_id,
        "route_id": route_id,
        "driver_id": driver_id,
        "vehicle_id": vehicle_id,
        **kwargs
    }
    
    # Eventos críticos tienen prioridad alta
    priority = EventPriority.HIGH if event_type in [
        EventType.TRIP_STARTED,
        EventType.TRIP_COMPLETED
    ] else EventPriority.NORMAL
    
    return BaseEvent(
        event_type=event_type,
        priority=priority,
        data=data
    )


def create_passenger_event(
    event_type: EventType,
    trip_id: int,
    route_id: int,
    passenger_id: int,
    student_id: int,
    **kwargs
) -> BaseEvent:
    """Factory para crear eventos de Passenger"""
    data = {
        "trip_id": trip_id,
        "route_id": route_id,
        "passenger_id": passenger_id,
        "student_id": student_id,
        **kwargs
    }
    
    return BaseEvent(
        event_type=event_type,
        priority=EventPriority.NORMAL,
        data=data
    )
