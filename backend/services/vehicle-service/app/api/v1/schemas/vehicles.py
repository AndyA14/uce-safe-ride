from pydantic import BaseModel, Field
from uuid import UUID


class VehicleCreateIn(BaseModel):
    plate: str = Field(min_length=5, max_length=20)
    brand: str = Field(min_length=1, max_length=80)
    model: str = Field(min_length=1, max_length=80)
    active: bool = True


class VehicleUpdateIn(BaseModel):
    plate: str | None = Field(default=None, min_length=5, max_length=20)
    brand: str | None = Field(default=None, min_length=1, max_length=80)
    model: str | None = Field(default=None, min_length=1, max_length=80)
    active: bool | None = None


class VehicleStatusUpdateIn(BaseModel):
    active: bool


class VehicleOut(BaseModel):
    id: UUID
    plate: str
    brand: str
    model: str
    active: bool

    class Config:
        from_attributes = True
