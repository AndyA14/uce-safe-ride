from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from uuid import UUID
from enum import Enum

class DriverStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ON_ROUTE = "ON_ROUTE"
    OFFLINE = "OFFLINE"

class DriverCreateIn(BaseModel):
    auth_user_id: UUID
    name: str = Field(min_length=3, max_length=100)
    ci: str = Field(min_length=10, max_length=13)
    license_number: str = Field(min_length=5, max_length=50)
    phone: Optional[str] = Field(default=None, min_length=7, max_length=20)

class DriverUpdateIn(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class DriverStatusUpdateIn(BaseModel):
    status: DriverStatus

class DriverOut(BaseModel):
    id: UUID
    auth_user_id: UUID
    name: str
    ci: str
    license_number: str
    phone: Optional[str]
    status: DriverStatus

    model_config = ConfigDict(from_attributes=True)
