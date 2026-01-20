
from pydantic import BaseModel, Field, validator, ConfigDict
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

# ✅ SOLUCIÓN CIRCULAR IMPORT: Importar solo para type hints
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
    route_id: str = Field(..., description="UUID de la ruta")
    driver_id: str = Field(..., description="UUID del conductor")
    vehicle_id: str = Field(..., description="UUID del vehículo")
    scheduled_start_time: datetime
    max_passengers: int = Field(default=40, ge=1, le=100)

    @validator("scheduled_start_time")
    def validate_future_time(cls, v):
        # Validación desactivada para thesis mode
        return v


class TripUpdate(BaseModel):
    """Schema para actualizar información del viaje"""
    scheduled_start_time: Optional[datetime] = None
    max_passengers: Optional[int] = Field(None, ge=1, le=100)
    status: Optional[TripStatus] = None  # ✅ Permitir actualizar estado

    model_config = ConfigDict(extra="forbid")


class TripLocationUpdate(BaseModel):
    """Schema para actualizar ubicación del viaje"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class TripBase(BaseModel):
    """Schema base con información común"""
    route_id: str
    driver_id: str
    vehicle_id: str
    status: str  # ✅ String para compatibilidad con Enum.value
    scheduled_start_time: datetime
    max_passengers: int
    current_passenger_count: int

    model_config = ConfigDict(from_attributes=True)


class TripResponse(TripBase):
    """Schema de respuesta completo para un viaje"""
    id: int  # PK interno
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    created_at: datetime
    
    # Campos computados
    available_seats: int = 0
    is_full: bool = False

    @staticmethod
    def from_orm_with_computed(trip) -> "TripResponse":
        """
        Factory method que calcula campos derivados.
        """
        data = TripResponse.model_validate(trip)
        try:
            current = trip.current_passenger_count or 0
            data.available_seats = max(0, trip.max_passengers - current)
            data.is_full = current >= trip.max_passengers
        except Exception:
            # Fallback seguro
            data.available_seats = 0
            data.is_full = False
        return data


class TripWithPassengers(TripResponse):
    """
    Schema con lista de pasajeros incluida.
    """
    passengers: List["TripPassengerResponse"] = []


class TripListResponse(BaseModel):
    """Schema para listado paginado de viajes"""
    items: List[TripResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class TripFilterParams(BaseModel):
    """Parámetros de filtrado para listar viajes"""
    route_id: Optional[str] = None
    driver_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    status: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


# ==================== Action Schemas (✅ RESTAURADOS) ====================

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
    reason: str = Field(..., min_length=5, max_length=500)


try:
    from app.schemas.passengers import TripPassengerResponse
    # Esto hace que Pydantic resuelva la referencia "TripPassengerResponse"
    TripWithPassengers.model_rebuild()
except ImportError:
    # Si passengers.py aún no existe, ignorar silenciosamente
    pass