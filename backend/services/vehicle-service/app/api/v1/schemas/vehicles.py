from pydantic import BaseModel
from uuid import UUID
from typing import Literal, Optional

VehicleType = Literal["BUS", "MINIBUS"]
VehicleStatus = Literal["AVAILABLE", "IN_ROUTE", "FULL", "MAINTENANCE"]


class VehicleBase(BaseModel):
    plate: str
    vehicle_type: VehicleType
    capacity: int
    status: VehicleStatus = "AVAILABLE"


class VehicleCreateIn(VehicleBase):
    pass


class VehicleUpdateIn(BaseModel):
    plate: Optional[str] = None
    vehicle_type: Optional[VehicleType] = None
    capacity: Optional[int] = None
    status: Optional[VehicleStatus] = None


class VehicleStatusUpdateIn(BaseModel):
    status: VehicleStatus


class VehicleOut(VehicleBase):
    id: UUID

    class Config:
        from_attributes = True
