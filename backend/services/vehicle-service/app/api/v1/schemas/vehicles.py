from pydantic import BaseModel
from uuid import UUID
from typing import Literal, Optional


# =========================
# ENUMS / TYPES
# =========================
VehicleType = Literal["BUS", "MINIBUS"]
VehicleStatus = Literal["AVAILABLE", "IN_ROUTE", "OFFLINE"]

PassengerStatus = Literal["ON_BOARD", "DROPPED_OFF", "HISTORY"]


# =========================
# VEHICLE SCHEMAS
# =========================

# -------------------------
# Base compartido
# -------------------------
class VehicleBase(BaseModel):
    plate: str
    vehicle_type: VehicleType
    capacity: int
    status: VehicleStatus = "AVAILABLE"
    model: Optional[str] = None


# -------------------------
# Entrada para creación
# -------------------------
class VehicleCreateIn(VehicleBase):
    driver_id: Optional[UUID] = None


# -------------------------
# Entrada para actualización
# -------------------------
class VehicleUpdateIn(BaseModel):
    plate: Optional[str] = None
    vehicle_type: Optional[VehicleType] = None
    capacity: Optional[int] = None
    status: Optional[VehicleStatus] = None
    model: Optional[str] = None
    driver_id: Optional[UUID] = None


# -------------------------
# Entrada solo para estado
# -------------------------
class VehicleStatusUpdateIn(BaseModel):
    status: VehicleStatus


# -------------------------
# Salida (respuesta API)
# -------------------------
class VehicleOut(VehicleBase):
    id: UUID
    driver_id: Optional[UUID] = None
    driver_name: Optional[str] = None
    driver_rating: Optional[float] = None

    class Config:
        from_attributes = True


# =========================
# PASSENGER SCHEMAS
# =========================

# -------------------------
# Entrada para subir al bus
# -------------------------
class PassengerJoinIn(BaseModel):
    student_user_id: str


# -------------------------
# Respuesta al subir
# -------------------------
class JoinResponse(BaseModel):
    message: str
    vehicle_id: UUID
    seat_number: int
    status: PassengerStatus


# -------------------------
# Salida Passenger
# -------------------------
class PassengerOut(BaseModel):
    id: UUID
    vehicle_id: UUID
    student_user_id: str
    status: PassengerStatus

    class Config:
        from_attributes = True
