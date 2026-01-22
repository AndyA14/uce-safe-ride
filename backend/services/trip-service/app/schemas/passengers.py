from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum


# ==================== ENUMS ====================

class PassengerStatus(str, Enum):
    """Estados de un pasajero en el viaje"""
    RESERVED = "RESERVED"   # Reservó lugar pero no ha abordado
    BOARDED = "BOARDED"     # Ya abordó el vehículo
    COMPLETED = "COMPLETED" # Completó el viaje
    NO_SHOW = "NO_SHOW"     # No se presentó


# ==================== Passenger Schemas ====================

class TripPassengerCreate(BaseModel):
    """Schema para agregar un pasajero a un viaje"""
    student_id: str = Field(..., description="UUID del estudiante")
    
    # 🟢 CORRECCIÓN: stop_id opcional
    stop_id: Optional[str] = Field(None, description="UUID de la parada donde abordará")
    
    fare_amount: float = Field(..., gt=0, description="Monto de la tarifa")


class TripPassengerUpdate(BaseModel):
    """Schema para actualizar información del pasajero"""
    stop_id: Optional[str] = Field(None, description="UUID de la parada")
    fare_amount: Optional[float] = Field(None, gt=0)

    model_config = ConfigDict(extra="forbid")


class TripPassengerBase(BaseModel):
    """Schema base de pasajero"""
    id: int  # PK interno
    trip_id: int  # FK al trip
    student_id: str  # UUID del estudiante
    
    # 🟢 CORRECCIÓN: stop_id opcional
    stop_id: Optional[str] = None 
    
    status: str  # String para compatibilidad con Enum.value
    fare_amount: float

    model_config = ConfigDict(from_attributes=True)


class TripPassengerResponse(TripPassengerBase):
    """Schema para respuesta de pasajero"""
    # 🟢 PRODUCCIÓN: reserved_at opcional porque puede abordar sin reservar
    reserved_at: Optional[datetime] = None 
    boarded_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    payment_id: Optional[str] = None
    payment_status: str = "PENDING"
    
    # 🟢 Obligatorios generados por la DB
    created_at: datetime
    updated_at: Optional[datetime] = None


# ==================== Action Schemas ====================

class PassengerBoardRequest(BaseModel):
    """Schema para marcar que un pasajero abordó"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitud donde abordó")
    longitude: float = Field(..., ge=-180, le=180, description="Longitud donde abordó")


class PassengerRemoveRequest(BaseModel):
    """Schema para eliminar un pasajero del viaje"""
    reason: str = Field(..., min_length=5, max_length=200)
