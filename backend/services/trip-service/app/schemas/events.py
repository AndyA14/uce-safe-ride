# services/trip-service/app/schemas/events.py
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

# ==========================================================
# SHARED STRUCTS
# ==========================================================

class LocationData(BaseModel):
    """Datos de ubicación GPS"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

# ==========================================================
# TRIP EVENTS 
# ==========================================================

class TripCreatedEvent(BaseModel):
    """Evento: trip.created"""
    trip_id: int                  
    route_id: str                
    driver_id: str                  
    vehicle_id: str                 
    scheduled_start_time: str        
    max_passengers: int
    status: str

class TripStartedEvent(BaseModel):
    """Evento: trip.started"""
    trip_id: int
    route_id: str
    driver_id: str
    vehicle_id: str
    actual_start_time: str           
    initial_location: LocationData
    status: str

class TripCompletedEvent(BaseModel):
    """Evento: trip.completed"""
    trip_id: int
    route_id: str
    driver_id: str
    vehicle_id: str
    actual_start_time: Optional[str] = None
    actual_end_time: str              
    passenger_count: int
    final_location: LocationData
    status: str

class TripCancelledEvent(BaseModel):
    """Evento: trip.cancelled"""
    trip_id: int
    route_id: str
    driver_id: str
    reason: str
    status: str

class TripLocationUpdatedEvent(BaseModel):
    """Evento: trip.location_updated"""
    trip_id: int
    route_id: str
    driver_id: str
    location: LocationData
    timestamp: str                   

# ==========================================================
# PASSENGER EVENTS
# ==========================================================

class PassengerJoinedEvent(BaseModel):
    """Evento: passenger.joined"""
    trip_id: int
    route_id: str
    passenger_id: int                 # ID interno
    student_id: str                   # UUID
    stop_id: str                      # UUID
    fare_amount: float
    status: str
    current_passenger_count: int

class PassengerBoardedEvent(BaseModel):
    """Evento: passenger.boarded"""
    trip_id: int
    route_id: str
    passenger_id: int
    student_id: str
    boarded_at: str                   
    status: str

class PassengerRemovedEvent(BaseModel):
    """Evento: passenger.removed"""
    trip_id: int
    route_id: str
    passenger_id: int
    student_id: str
    reason: str
    current_passenger_count: int

# ==========================================================
# EVENT ENVELOPE (KAFKA)
# ==========================================================

class EventEnvelope(BaseModel):
    """Envoltura estándar para todos los eventos"""
    event_type: str
    timestamp: str                    # ISO format
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None