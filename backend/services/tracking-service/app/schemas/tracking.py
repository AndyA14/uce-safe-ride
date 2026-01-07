from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class TrackingCreate(BaseModel):
    driver_id: UUID
    vehicle_id: UUID
    latitude: float
    longitude: float
    speed: float | None = None
    heading: float | None = None


class TrackingResponse(BaseModel):
    id: UUID
    driver_id: UUID
    vehicle_id: UUID
    latitude: float
    longitude: float
    speed: float | None
    heading: float | None
    recorded_at: datetime

    class Config:
        from_attributes = True  
