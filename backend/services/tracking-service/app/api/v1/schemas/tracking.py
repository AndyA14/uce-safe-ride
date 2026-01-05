from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class LocationIn(BaseModel):
    vehicle_id: UUID
    latitude: float
    longitude: float

class LocationOut(LocationIn):
    id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True
