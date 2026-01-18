from pydantic import BaseModel, Field, validator, ConfigDict
from datetime import datetime
from typing import Optional, List
from enum import Enum


class TripStatus(str, Enum):
    CREATED = "CREATED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PassengerStatus(str, Enum):
    RESERVED = "RESERVED"
    BOARDED = "BOARDED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"


# ============= Trip Schemas =============

class TripCreate(BaseModel):
    """Schema para crear un nuevo viaje"""
    route_id: int = Field(..., gt=0, description="ID de la ruta a ejecutar")
    driver_id: int = Field(..., gt=0, description="ID del conductor")
    vehicle_id: int = Field(..., gt=0, description="ID del vehículo")
    scheduled_start_time: datetime = Field(..., description="Hora programada de inicio")
    max_passengers: int = Field(default=40, ge=1, le=100)
    
    @validator('scheduled_start_time')
    def validate_future_time(cls, v):
        if v < datetime.now(v.tzinfo):
            raise ValueError('La hora programada debe ser futura')
        return v


class TripUpdate(BaseModel):
    """Schema para actualizar información del viaje"""
    scheduled_start_time: Optional[datetime] = None
    max_passengers: Optional[int] = Field(None, ge=1, le=100)
    
    model_config = ConfigDict(extra='forbid')


class TripLocationUpdate(BaseModel):
    """Schema para actualizar ubicación del viaje"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class TripBase(BaseModel):
    """Schema base con información común"""
    id: int
    route_id: int
    driver_id: int
    vehicle_id: int
    status: TripStatus
    scheduled_start_time: datetime
    max_passengers: int
    current_passenger_count: int
    
    model_config = ConfigDict(from_attributes=True)


class TripResponse(TripBase):
    """Schema de respuesta completo para un viaje"""
    actual_start_time: Optional[datetime] = None
    estimated_end_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    last_location_update: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Campos calculados
    available_seats: int = Field(default=0)
    is_full: bool = Field(default=False)
    
    @staticmethod
    def from_orm_with_computed(trip) -> "TripResponse":
        """Factory method que incluye campos calculados"""
        data = TripResponse.model_validate(trip)
        data.available_seats = trip.available_seats
        data.is_full = trip.is_full
        return data


class TripWithPassengers(TripResponse):
    """Schema con lista de pasajeros incluida"""
    passengers: List["TripPassengerResponse"] = []


class TripListResponse(BaseModel):
    """Schema para listado paginado de viajes"""
    items: List[TripResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============= Passenger Schemas =============

class TripPassengerCreate(BaseModel):
    """Schema para agregar un pasajero a un viaje"""
    student_id: int = Field(..., gt=0)
    stop_id: int = Field(..., gt=0, description="Parada donde abordará")
    fare_amount: float = Field(..., gt=0, description="Monto de la tarifa")


class TripPassengerUpdate(BaseModel):
    """Schema para actualizar información del pasajero"""
    stop_id: Optional[int] = Field(None, gt=0)
    fare_amount: Optional[float] = Field(None, gt=0)


class TripPassengerBase(BaseModel):
    """Schema base de pasajero"""
    id: int
    trip_id: int
    student_id: int
    stop_id: int
    status: PassengerStatus
    fare_amount: float
    
    model_config = ConfigDict(from_attributes=True)


class TripPassengerResponse(TripPassengerBase):
    """Schema de respuesta completo para pasajero"""
    reserved_at: datetime
    boarded_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    payment_id: Optional[str] = None
    payment_status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


# ============= Action Schemas =============

class TripStartRequest(BaseModel):
    """Schema para iniciar un viaje"""
    initial_latitude: float = Field(..., ge=-90, le=90)
    initial_longitude: float = Field(..., ge=-180, le=180)


class TripCompleteRequest(BaseModel):
    """Schema para completar un viaje"""
    final_latitude: float = Field(..., ge=-90, le=90)
    final_longitude: float = Field(..., ge=-180, le=180)
    notes: Optional[str] = Field(None, max_length=500)


class TripCancelRequest(BaseModel):
    """Schema para cancelar un viaje"""
    reason: str = Field(..., min_length=10, max_length=500)


class PassengerBoardRequest(BaseModel):
    """Schema para marcar que un pasajero abordó"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


# ============= Query Schemas =============

class TripFilterParams(BaseModel):
    """Parámetros de filtrado para listar viajes"""
    route_id: Optional[int] = None
    driver_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    status: Optional[TripStatus] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


# Resolver forward references para TripWithPassengers
TripWithPassengers.model_rebuild()