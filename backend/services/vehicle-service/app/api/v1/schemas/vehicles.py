from pydantic import BaseModel, Field
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

# =========================
# ENUMS / TYPES
# =========================

VehicleType = Literal["BUS", "MINIBUS"]
VehicleStatus = Literal["AVAILABLE", "IN_ROUTE", "OFFLINE"]
PassengerStatus = Literal["ON_BOARD", "DROPPED_OFF", "HISTORY"]

# =========================
# VEHICLE SCHEMAS
# =========================

class VehicleBase(BaseModel):
    plate: str = Field(..., min_length=1, max_length=20)
    vehicle_type: VehicleType
    capacity: int = Field(..., gt=0)
    status: VehicleStatus = "AVAILABLE"
    model: Optional[str] = None


class VehicleCreateIn(VehicleBase):
    driver_id: Optional[UUID] = None


class VehicleUpdateIn(BaseModel):
    plate: Optional[str] = Field(None, min_length=1, max_length=20)
    vehicle_type: Optional[VehicleType] = None
    capacity: Optional[int] = Field(None, gt=0)
    status: Optional[VehicleStatus] = None
    driver_id: Optional[UUID] = None
    model: Optional[str] = None


class VehicleStatusUpdateIn(BaseModel):
    status: VehicleStatus


class VehicleOut(VehicleBase):
    id: UUID
    driver_id: Optional[UUID] = None
    is_active: bool

    # ✅ CAMPOS CORREGIDOS (EVITAN ResponseValidationError)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =========================
# PASSENGER SCHEMAS
# =========================

class PassengerJoinIn(BaseModel):
    student_user_id: str


class JoinResponse(BaseModel):
    message: str
    vehicle_id: UUID
    seat_number: int
    status: PassengerStatus


class PassengerOut(BaseModel):
    id: UUID
    vehicle_id: UUID
    student_user_id: str
    status: PassengerStatus

    class Config:
        from_attributes = True
