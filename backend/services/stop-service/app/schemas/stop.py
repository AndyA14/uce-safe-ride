from uuid import UUID
from pydantic import BaseModel


class StopBase(BaseModel):
    name: str
    latitude: float
    longitude: float


class StopCreate(StopBase):
    pass


class StopUpdate(BaseModel):
    name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    active: bool | None = None


class StopOut(StopBase):
    id: UUID
    active: bool

    class Config:
        from_attributes = True
