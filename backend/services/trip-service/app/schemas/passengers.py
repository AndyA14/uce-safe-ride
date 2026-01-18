from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum


class PassengerStatus(str, Enum):
    RESERVED = "RESERVED"
    BOARDED = "BOARDED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"


class TripPassengerCreate(BaseModel):
    """Schema para agregar un pasajero a un viaje"""
    student_id: int = Field(..., gt=0, description="ID del estudiante")
    stop_id: int = Field(..., gt=0, description="ID de la parada donde abordará")
    fare_amount: float = Field(..., gt=0, description="Monto de la tarifa")


class TripPassengerUpdate(BaseModel):
    """Schema para actualizar información del pasajero"""
    stop_id: Optional[int] = Field(None, gt=0)
    fare_amount: Optional[float] = Field(None, gt=0)
    
    model_config = ConfigDict(extra='forbid')


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


class PassengerBoardRequest(BaseModel):
    """Schema para marcar que un pasajero abordó"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitud donde abordó")
    longitude: float = Field(..., ge=-180, le=180, description="Longitud donde abordó")