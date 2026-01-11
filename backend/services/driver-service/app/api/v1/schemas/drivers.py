from pydantic import BaseModel, Field
from typing import Literal, Optional
from uuid import UUID

DriverStatus = Literal["AVAILABLE", "ON_ROUTE", "OFFLINE"]


class DriverCreateIn(BaseModel):
    name: str = Field(min_length=3, max_length=100)
    license_number: str = Field(min_length=5, max_length=50)
    phone: Optional[str] = Field(default=None, min_length=7, max_length=20)


class DriverUpdateIn(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class DriverStatusUpdateIn(BaseModel):
    status: DriverStatus


class DriverOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    license_number: str
    phone: Optional[str]
    status: DriverStatus

    class Config:
        from_attributes = True
