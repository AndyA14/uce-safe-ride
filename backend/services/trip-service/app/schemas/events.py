from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, Optional


class LocationData(BaseModel):
    """Datos de ubicación GPS"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class TripCreatedEvent(BaseModel):
    """Evento: trip.created"""
    trip_id: int
    route_id: int
    driver_id: int
    vehicle_id: int
    scheduled_start_time: str  # ISO format
    max_passengers: int
    status: str


class TripStartedEvent(BaseModel):
    """Evento: trip.started - CRÍTICO para WebSocket y Tracking"""
    trip_id: int
    route_id: int
    driver_id: int
    vehicle_id: int
    actual_start_time: str  # ISO format
    initial_location: LocationData
    status: str


class TripCompletedEvent(BaseModel):
    """Evento: trip.completed - CRÍTICO para Payment Service"""
    trip_id: int
    route_id: int
    driver_id: int
    vehicle_id: int
    actual_start_time: Optional[str] = None  # ISO format
    actual_end_time: str  # ISO format
    passenger_count: int
    final_location: LocationData
    status: str


class TripCancelledEvent(BaseModel):
    """Evento: trip.cancelled"""
    trip_id: int
    route_id: int
    driver_id: int
    reason: str
    status: str


class TripLocationUpdatedEvent(BaseModel):
    """Evento: trip.location_updated (opcional)"""
    trip_id: int
    route_id: int
    driver_id: int
    location: LocationData
    timestamp: str  # ISO format


class PassengerJoinedEvent(BaseModel):
    """Evento: passenger.joined"""
    trip_id: int
    route_id: int
    passenger_id: int
    student_id: int
    stop_id: int
    fare_amount: float
    status: str
    current_passenger_count: int


class PassengerBoardedEvent(BaseModel):
    """Evento: passenger.boarded"""
    trip_id: int
    route_id: int
    passenger_id: int
    student_id: int
    boarded_at: str  # ISO format
    status: str


class PassengerRemovedEvent(BaseModel):
    """Evento: passenger.removed"""
    trip_id: int
    route_id: int
    passenger_id: int
    student_id: int
    reason: str
    current_passenger_count: int


# Event wrapper genérico
class EventEnvelope(BaseModel):
    """Envoltura estándar para todos los eventos"""
    event_type: str
    timestamp: str  # ISO format
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None
