from pydantic import BaseModel, Field
from uuid import UUID

class StopCreateIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    latitude: float
    longitude: float
    active: bool = True

class StopOut(BaseModel):
    id: UUID               
    name: str
    latitude: float
    longitude: float
    active: bool

    class Config:
        from_attributes = True
