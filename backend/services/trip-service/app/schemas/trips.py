from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional, List, Union, TYPE_CHECKING
from enum import Enum
from uuid import UUID  


if TYPE_CHECKING:
    from app.schemas.passengers import TripPassengerResponse

class TripStatus(str, Enum):
    CREATED = "CREATED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# ==================== CRUD Schemas ====================

class TripCreate(BaseModel):
    """Schema para crear un nuevo viaje"""
    # ✅ CAMBIO 1: Aceptamos Union[str, int, UUID] para ser tolerantes
    route_id: Union[str, int, UUID] = Field(..., description="UUID de la ruta")
    driver_id: Union[str, int, UUID] = Field(..., description="UUID del conductor")
    vehicle_id: Union[str, int, UUID] = Field(..., description="UUID del vehículo")
    
    scheduled_start_time: datetime
    max_passengers: int = Field(default=40, ge=1, le=100)

    # ✅ CAMBIO 2: Validador Universal (Convierte TODO a String para guardar)
    @field_validator('route_id', 'driver_id', 'vehicle_id', mode='before')
    @classmethod
    def force_to_string(cls, v):
        """Si llega un UUID objeto o un Int, lo vuelve String automáticamente"""
        if v is None:
            return None
        return str(v)

    @field_validator("scheduled_start_time")
    @classmethod
    def validate_future_time(cls, v):
        return v

class TripUpdate(BaseModel):
    """Schema para actualizar información del viaje"""
    scheduled_start_time: Optional[datetime] = None
    max_passengers: Optional[int] = Field(None, ge=1, le=100)
    status: Optional[TripStatus] = None 

    model_config = ConfigDict(extra="forbid")

class TripLocationUpdate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class TripBase(BaseModel):
    """Schema base con información común"""
    route_id: str
    driver_id: str
    vehicle_id: str
    status: str
    scheduled_start_time: datetime
    max_passengers: int
    current_passenger_count: int

    model_config = ConfigDict(from_attributes=True)

class TripResponse(TripBase):
    """Schema de respuesta completo para un viaje"""
    # ✅ CAMBIO 3: Tolerancia en la respuesta del ID
    # Aunque internamente es int, esto asegura que Pydantic no falle al serializar
    id: Union[int, str] 
    
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    created_at: datetime
    
    # Campos computados
    available_seats: int = 0
    is_full: bool = False

    @staticmethod
    def from_orm_with_computed(trip) -> "TripResponse":
        data = TripResponse.model_validate(trip)
        try:
            current = trip.current_passenger_count or 0
            data.available_seats = max(0, trip.max_passengers - current)
            data.is_full = current >= trip.max_passengers
        except Exception:
            data.available_seats = 0
            data.is_full = False
        return data

class TripWithPassengers(TripResponse):
    passengers: List["TripPassengerResponse"] = []

class TripListResponse(BaseModel):
    items: List[TripResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ✅ CAMBIO 4: Filtros también tolerantes
class TripFilterParams(BaseModel):
    route_id: Union[str, int, UUID, None] = None
    driver_id: Union[str, int, UUID, None] = None
    vehicle_id: Union[str, int, UUID, None] = None
    status: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

    @field_validator('route_id', 'driver_id', 'vehicle_id', mode='before')
    @classmethod
    def force_to_string_filters(cls, v):
        if v is None:
            return None
        return str(v)

# ==================== Action Schemas ====================

class TripStartRequest(BaseModel):
    initial_latitude: float = Field(..., ge=-90, le=90)
    initial_longitude: float = Field(..., ge=-180, le=180)

class TripCompleteRequest(BaseModel):
    final_latitude: float = Field(..., ge=-90, le=90)
    final_longitude: float = Field(..., ge=-180, le=180)
    notes: Optional[str] = Field(None, max_length=500)

class TripCancelRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)

try:
    from app.schemas.passengers import TripPassengerResponse
    TripWithPassengers.model_rebuild()
except ImportError:
    pass

class PassengerCreate(BaseModel):
    student_id: str  
    stop_id: Optional[str] = None
    fare_amount: float = 0.25 

class StudentResponse(BaseModel):
    id: int
    trip_id: int
    student_id: str
    status: str       
    fare_amount: float
    created_at: Optional[datetime] = None
    boarded_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True